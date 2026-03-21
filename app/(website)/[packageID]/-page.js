'use client'

import { COLLECTIONS, IMAGES } from "../../../constants";
import Data from "../../../lib/backend";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import lightGallery from 'lightgallery';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import Header from "../../../components/website/Header";
import Image from "next/image";
import { CircleCheckBig, CircleX, Images, MapPin, ImageIcon, ChevronUp } from "lucide-react";
import { csvToArray, formatNumber } from "../../../functions";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Skeleton } from "../../../components/ui/skeleton";
import Button from "../../../components/Buttons";
import usePopup from "../../../hooks/usePopup";
import DetailBlock from "../../../components/website/DetailBlock";
import CustomImg from "../../../components/website/CustomImg";
import { QueryForm } from "../../../components/Forms";
import Widget from "../../../components/Widget";
import moment from "moment";
import { useCurrency } from "../../../context/CurrencyContext";
import { useTranslation } from "../../../hooks/useTranslation";
import BreadCrumb from "../../../components/BreadCrumb";

function saveToRecentlyViewed(packageData) {
  if (typeof window === 'undefined') return;
  try {
    const STORAGE_KEY = 'india_escapes_recently_viewed';
    const MAX_ITEMS = 6;
    let recentlyViewed = [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) recentlyViewed = JSON.parse(stored);
    recentlyViewed = recentlyViewed.filter(item => item.id !== packageData.id);
    recentlyViewed.unshift({
      id: packageData.id,
      name: packageData.name,
      url: packageData.url,
      price: packageData.price,
      offer_price: packageData.offer_price,
      featured_image: packageData.featured_image,
      duration: packageData.duration,
      viewedAt: new Date().toISOString()
    });
    recentlyViewed = recentlyViewed.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
  } catch (error) {
    console.error('Error saving to recently viewed:', error);
  }
}

export default function PackageClient({ packageID }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { currency } = useCurrency();
  const { t } = useTranslation();
  const [breadCrumb, setBC] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingItinerary, setLoadingItinerary] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [itinerary, setItinerary] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [relatedPackages, setRelatedPackages] = useState([]);
  const [fetchingRelated, setFetchingRelated] = useState(false);
  const [openDays, setOpenDays] = useState([]);
  const [allExpanded, setAllExpanded] = useState(false);

  const tabs = [
    { id: 'overview', label: t('detail.overview') },
    { id: 'itinerary', label: t('detail.itinerary') },
    { id: 'tour_inclusions', label: t('detail.tourInclusions') },
    { id: 'important_info', label: t('detail.importantInfo') },
  ];

  let [deal, setDeal] = useState({
    name: '', discount: '', end_date: null, active: false, days_remaining: 0
  });

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [detailBlock, setDetailBlock] = useState(null);
  const { showDialog, hideDialog, dialog } = usePopup({
    form: detailBlock,
    container_styles: 'max-w-[500px]'
  });

  const [state, setState] = useState({
    name: '', price: '', offer_price: '', description: '', inclusions: [], duration: '',
    images: [], active: false, categories: [], locations: [], seo_keywords: '',
    featured_image: '', tags: [], extra_content: '', exclusions: [], discount: 0, pid: null, widget: ''
  });

  const sectionRefs = {
    overview: useRef(null),
    itinerary: useRef(null),
    tour_inclusions: useRef(null),
    important_info: useRef(null),
  };

  const toggleDay = (index) => {
    setOpenDays(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleAll = () => {
    if (allExpanded) {
      setOpenDays([]);
      setAllExpanded(false);
    } else {
      setOpenDays(itinerary.map((_, i) => i));
      setAllExpanded(true);
    }
  };

  useEffect(() => {
    setAllExpanded(openDays.length === itinerary.length && itinerary.length > 0);
  }, [openDays, itinerary.length]);

  const loadPackage = async () => {
    setLoading(true);
    try {
      const d = await Data.get_item_detail({ collection_id: COLLECTIONS.PACKAGES, url: packageID, item_type: 'package' });
      if (d.status === 'success') {
        const { name, images, price, offer_price, description, inclusions, categories, duration, active, locations, seo_keywords, featured_image, tags, extra_content, exclusions, id, widget, deal_metadata } = d.document;

        let discount = 0;
        setBreadCrumb(name);
        if (offer_price && price) {
          let off = Math.round(((parseInt(offer_price) || 0) / (parseInt(price) || 0)) * 100);
          discount = isNaN(off) ? 0 : 100 - off;
        }
        if (deal_metadata) {
          let dm = JSON.parse(deal_metadata);
          setDeal({
            name: dm.name || '',
            discount: dm.discount_rate || '',
            end_date: dm.end_date || null,
            active: dm.status == 'active',
            days_remaining: moment(dm.end_date).diff(moment(), 'days') || 0
          });
        }
        fetchItinerary(id);
        fetchExpenses(id);
        fetchRelatedPackages(id);
        setState({
          ...state,
          name, images, price, offer_price, description,
          inclusions: inclusions ? inclusions.split(';') : [],
          categories, duration, active, locations, seo_keywords,
          featured_image, tags: tags ? csvToArray(tags) : [],
          extra_content, exclusions: exclusions ? exclusions.split(";") : [], discount, pid: id, widget
        });
        document.title = name;
        saveToRecentlyViewed({ id, name, url: packageID, price, offer_price, featured_image, duration });
      } else {
        toast.error(d.message);
        router.replace('/packages');
      }
    } catch (err) {
      toast.error(err.message);
      router.replace('/packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchItinerary = async (pid) => {
    setLoadingItinerary(true);
    try {
      const d = await Data.fetch_itinerary(pid);
      if (d.status === 'success') setItinerary(d.itinerary);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingItinerary(false);
    }
  };

  const fetchExpenses = async (pid) => {
    setLoadingExpenses(true);
    try {
      const d = await Data.fetch_expenses(pid);
      if (d.status === 'success') setExpenses(d.expenses);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingExpenses(false);
    }
  };

  async function fetchRelatedPackages(pid) {
    setFetchingRelated(true);
    Data.fetchRelatedPackages(pid, [], 3).then(d => {
      setRelatedPackages(d.packages);
    }).catch(() => { }).finally(() => {
      setFetchingRelated(false);
    });
  }

  useEffect(() => {
    if (packageID) loadPackage();
    else router.replace('/packages');
  }, [packageID]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    const ref = sectionRefs[tabId]?.current;
    if (ref) {
      const y = ref.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (loading) return;
    const offsets = {};
    Object.entries(sectionRefs).forEach(([id, ref]) => {
      if (ref.current) offsets[id] = ref.current.offsetTop - 120;
    });
    const onScroll = () => {
      const scrollY = window.scrollY;
      let newTab = 'overview';
      let maxBelow = -Infinity;
      Object.entries(offsets).forEach(([id, top]) => {
        if (scrollY >= top && top > maxBelow) {
          maxBelow = top;
          newTab = id;
        }
      });
      if (newTab !== activeTab) setActiveTab(newTab);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [loading, activeTab, pathname, router]);

  const [showStickyButtons, setShowStickyButtons] = useState(false);
  const scrollThreshold = 300;
  useEffect(() => {
    const handleScroll = () => setShowStickyButtons(window.scrollY > scrollThreshold);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function setBreadCrumb(name) {
    let bc_array = [{ text: 'Home', url: '/' }, { text: name, url: '' }];
    setBC(<BreadCrumb options={bc_array} active={name} />);
  }

  return (
    <div>
      {dialog}
      <Header color="black" fixed={{ mobile: false, desktop: false }} />
      {loading ? (
        <div className="w_80_90 mx-auto my-4 space-y-12">
          <PackageImagesLoading />

          <Skeleton className="h-10 w-3/4 mb-2" />
          <div className="flex gap-2 flex-wrap">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-full" />
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto py-2 border-t border-b border-gray-100">
            {tabs.map((tab) => (
              <Skeleton
                key={tab.id}
                className={`h-10 w-28 shrink-0 rounded-xl ${
                  tab.id === 'overview' ? 'bg-red/20' : ''
                }`}
              />
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-[70%] space-y-12">
              <section id="overview">
                <Skeleton className="h-8 w-32 mb-3" />
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </section>

              <section id="itinerary">
                <Skeleton className="h-8 w-24 mb-3" />
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="ml-8">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6 mt-1" />
                      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                        {[...Array(2)].map((_, j) => (
                          <Skeleton
                            key={j}
                            className="h-24 w-32 rounded-xl shrink-0"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section id="tour_inclusions">
                <div className="grid gap-8">
                  <div>
                    <Skeleton className="h-8 w-48 mb-3" />
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Skeleton className="h-5 w-5 rounded-full" />
                          <Skeleton className="h-4 flex-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Skeleton className="h-8 w-48 mb-3" />
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Skeleton className="h-5 w-5 rounded-full" />
                          <Skeleton className="h-4 flex-1 opacity-60" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section id="important_info">
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </section>

              <section id="optional_addons">
                <Skeleton className="h-8 w-36 mb-4" />
                <div className="grid gap-4 md:grid-cols-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-100 rounded-2xl p-5"
                    >
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex-1">
              <div className="p-4 lg:p-6 border border-gray-200 bg-gray-50 rounded-3xl space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-40" />
                <div className="flex gap-2">
                  <Skeleton className="h-12 flex-1 rounded-full" />
                  <Skeleton className="h-12 flex-1 rounded-full" />
                </div>
                <div className="flex justify-center gap-2">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </div>

              <div className="mt-8">
                <Skeleton className="h-7 w-48 mb-4" />
                <div className="grid gap-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-60 lg:h-100 rounded-3xl"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <PackageImages images={state.images} t={t} />

          <div className="w_80_90 mx-auto my-8 lg:my-12">
            {breadCrumb}
            <h1 className="text-2xl font-semibold md:text-3xl lg:text-4xl">{state.name}</h1>
            {state.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap my-2 lg:my-4">
                {state.tags.map((tag, i) => (
                  <Link key={i} href={`/tag/${tag.toLowerCase().replaceAll(' ', '-')}`} target="_blank"
                    className="capitalize text-blue bg-blue/5 p-1 px-3 rounded-full border border-[#e7edf3] text-xs lg:text-sm transition hover:brightness-90">
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex items-center justify-start overflow-x-auto border-t border-b border-gray-100 py-2 gap-2 mb-6 sticky top-0 bg-white" style={{ zIndex: 4 }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => handleTabClick(tab.id)}
                  className={`p-2 px-4 shrink-0 rounded-xl transition duration-300 ${activeTab === tab.id ? 'bg-red text-white' : 'bg-transparent text-black hover:bg-gray-50'} capitalize lg:text-lg lg:px-6`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-[70%] space-y-12">

                <section id="overview" ref={sectionRefs.overview}>
                  <h2 className="text-lg font-medium lg:text-3xl mb-3">{t('detail.description')}</h2>
                  <div className="package_ec_css text-sm lg:text-base text-gray-700" dangerouslySetInnerHTML={{ __html: state.description }} />
                </section>

                <section id="itinerary" ref={sectionRefs.itinerary}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium lg:text-3xl">{t('detail.itinerary')}</h2>
                    {itinerary.length > 0 && (
                      <button onClick={toggleAll} className="text-sm underline transition">
                        {allExpanded ? 'Collapse All' : 'Expand All'}
                      </button>
                    )}
                  </div>

                  {loadingItinerary ? (
                    <div className="space-y-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="ml-8">
                          <Skeleton className="h-6 w-48 mb-2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6 mt-1" />
                        </div>
                      ))}
                    </div>
                  ) : itinerary.length > 0 ? (
                    <div className="space-y-4">
                      {itinerary.map((d, i) => (
                        <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition shadow-gray-50">
                          <button onClick={() => toggleDay(i)} className="w-full p-3 lg:px-6 lg:py-5 flex items-center justify-between text-left gap-4 hover:bg-gray-50 transition">
                            <div className="flex items-center gap-4 justify-start lg:justify-between flex-1">
                              <div className={`w-8 aspect-square rounded-full flex-center-jc text-white font-medium text-xs md:text-sm ${i === 0 ? 'bg-red' : 'bg-gray-600'}`}>
                                {d.day}
                              </div>
                              <p className="font-medium lg:text-xl w-[80%] lg:flex-1 lg:w-auto">
                                Day {d.day} - {d.title}
                              </p>
                              <ChevronUp className={`duration-300 text-red ${openDays.includes(i) ? '' : 'rotate-180'}`} size={14}/>
                            </div>
                          </button>

                          <div className={`transition-all duration-500 ease-in-out ${openDays.includes(i) ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                            <div className="p-3 md:px-6 md:pb-6 space-y-6 border-t border-gray-100">
                              <div className="text-xs md:text-sm text-gray-700 leading-relaxed">
                                {d.description}
                              </div>

                              {d.location_metadata?.length > 0 && (
                                <div>
                                  <p className="font-medium text-lg mb-3">{t('detail.locations')}</p>
                                  <div className="flex gap-3 overflow-x-auto pb-2">
                                    {d.location_metadata.map((l, j) => (
                                      <MetaDataBlock key={j} {...l} type="location" fun={() => {
                                        setDetailBlock(<DetailBlock id={l.id || null} type="LOCATIONS" />);
                                        showDialog();
                                      }} />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {d.activity_metadata?.length > 0 && (
                                <div>
                                  <p className="font-medium text-lg mb-3">{t('detail.activities')}</p>
                                  <div className="flex gap-3 overflow-x-auto pb-2">
                                    {d.activity_metadata.map((a, j) => (
                                      <MetaDataBlock key={j} {...a} type="activity" fun={() => {
                                        setDetailBlock(<DetailBlock id={a.id || null} type="ACTIVITIES" />);
                                        showDialog();
                                      }} />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {d.accommodation_metadata?.length > 0 && (
                                <div>
                                  <p className="font-medium text-lg mb-3">{t('detail.accommodations')}</p>
                                  <div className="flex gap-3 overflow-x-auto pb-2">
                                    {d.accommodation_metadata.map((acc, j) => (
                                      <MetaDataBlock key={j} {...acc} type="accommodation" fun={() => {
                                        setDetailBlock(<DetailBlock id={acc.id || null} type="ACCOMMODATIONS" />);
                                        showDialog();
                                      }} />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </section>

                <section id="tour_inclusions" ref={sectionRefs.tour_inclusions}>
                  <div className="grid gap-8">
                    {state.inclusions.length > 0 && (
                      <div>
                        <h2 className="text-lg font-medium lg:text-3xl mb-3">
                          {t('detail.packageIncludes')} <span className="text-red">{t('detail.includes')}</span>
                        </h2>
                        <div className="space-y-2">
                          {state.inclusions.map((inc, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <CircleCheckBig size={16} className="text-green-600" />
                              <p className="text-sm flex-1">{inc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {state.exclusions.length > 0 && (
                      <div>
                        <h2 className="text-lg font-medium lg:text-3xl mb-3">
                          {t('detail.packageIncludes')} <span className="text-red">{t('detail.excludes')}</span>
                        </h2>
                        <div className="space-y-2">
                          {state.exclusions.map((exc, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <CircleX size={16} className="text-gray-500" />
                              <p className="text-sm opacity-60 flex-1">{exc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <section id="important_info" ref={sectionRefs.important_info}>
                  {state.extra_content ? (
                    <div className="package_ec_css text-sm lg:text-base text-gray-700" dangerouslySetInnerHTML={{ __html: state.extra_content }} />
                  ) : null}
                </section>

                {!loadingExpenses && <ExpenseSection expenses={expenses} />}
              </div>

              <div className="flex-1 relative">
                {deal.active && deal.days_remaining > 0 ? (
                  <div className="rounded-3xl text-white bg-[#03b2cb] p-4 mb-4">
                    <p>{deal.name}</p>
                    {deal.discount ? <p className="text-lg md:text-2xl lg:text-3xl mt-2">Get <span className="font-semibold">{deal.discount}%</span> off!</p> : null}
                    {deal.days_remaining < 10 ? <p className="block w-full animate-pulse text-white text-[10px] font-light">Hurry! {deal.days_remaining} day{deal.days_remaining > 1 ? 's' : ''} remaining</p> : null}
                  </div>
                ) : null}

                <div className="p-4 lg:p-6 border border-gray-200 bg-gray-50 rounded-3xl overflow-hidden">
                  {state.discount > 0 && <p>{t('common.from')} <span className="line-through">{formatNumber(state.price, currency)}</span></p>}
                  {(state.price || state.offer_price) ? (
                    <div className="flex items-center justify-between w-full">
                      <p className="font-medium text-lg md:text-xl lg:text-3xl">
                        {formatNumber(state.offer_price || state.price || 0, currency)}
                        <span className="text-sm text-gray-600 font-light">/{t('common.perPerson').split(' ')[1] || 'person'}</span>
                      </p>
                      {state.discount ? <div className="border border-red text-red rounded-full flex-center-jc p-2 px-3 font-medium">-{state.discount}%</div> : null}
                    </div>
                  ) : null}

                  <div className="my-2 lg:my-4 flex items-center justify-start gap-2 rounded-full bg-white p-2">
                    <div className="h-16 aspect-square rounded-full flex-center-jc">
                      <Image src={IMAGES.call} height={200} width={200} alt="" className="h-[60%] object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{t('detail.talkToExpert')}</p>
                      <Link href="tel:+918091066115" className="font-semibold text-xl lg:text-2xl transition duration-500 hover:text-red">+91 80910 66115</Link>
                    </div>
                  </div>

                  <div className={`flex-center-jc gap-2 mx-auto w-[100%] fixed bottom-0 left-0 h-auto bg-white p-2 border-t border-gray-200 lg:relative lg:p-0 lg:border-none transition-transform duration-300 ease-in-out ${showStickyButtons ? 'translate-y-0' : 'translate-y-full'} lg:translate-y-0`} style={{ zIndex: 5 }}>
                    <Button onClick={() => {
                      if (state.widget) {
                        document.getElementById('wetravel_widget')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      } else {
                        setDetailBlock(<QueryForm destination={state.name} type="quote" onSave={hideDialog} />);
                        showDialog();
                      }
                    }} disabled={loading} styles="px-4 py-2 flex-1 border border-red text-white bg-red whitespace-nowrap">
                      {t('detail.getQuote')}
                    </Button>
                  </div>
                </div>

                {state.widget ? <div id="wetravel_widget" className="my-4"><Widget uuid={state.widget} /></div> : null}

                {fetchingRelated ? null : relatedPackages.length > 0 ? (
                  <>
                    <div className="mt-8 mb-4">
                      <p className="text-lg font-semibold lg:text-xl flex-1" style={{ lineHeight: '120%' }}>
                        {t('detail.moreDiscover')} <span className="text-red">{t('detail.discover')}</span>
                      </p>
                    </div>
                    <div className="grid gap-4">
                      {relatedPackages.map((pkg, i) => {
                        let duration_string = pkg.duration ? `${pkg.duration}D/${pkg.duration - 1}N` : '';
                        return (
                          <Link key={i} href={`/${pkg.url}`}>
                            <div className="h-88 lg:h-108 rounded-3xl group overflow-hidden relative">
                              <Image src={pkg.featured_image || IMAGES.placeholder} height={400} width={400} className="h-full w-full absolute object-cover transition duration-300 group-hover:scale-110" alt="" style={{ zIndex: -1 }} />
                              <div className="h-full w-full flex items-start p-4 justify-end flex-col bg-gradient-to-t from-black/50 to-transparent text-white z-10">
                                <p className="w-fit p-1 px-2 bg-red text-white rounded-full text-xs mb-1">{duration_string}</p>
                                <p className="font-medium text-lg lg:text-xl">{pkg.name}</p>
                                {(pkg.price || pkg.offer_price) ? <p className="font-medium">{t('common.from')} {formatNumber(pkg.offer_price || pkg.price || 0, currency)}</p> : null}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PackageImages({ images, t }) {
  const containerRef = useRef(null);
  const lgRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !images?.length) return;

    const raf = requestAnimationFrame(() => {
      const lg = lightGallery(containerRef.current, {
        selector: 'a',
        plugins: [lgThumbnail, lgZoom],
        speed: 400,
        thumbnail: false,
        zoom: false,
        download: false,
        counter: true,
        mobileSettings: { controls: false, showCloseIcon: true },
      });
      lgRef.current = lg;
    });

    return () => {
      cancelAnimationFrame(raf);
      lgRef.current?.destroy();
    };
  }, [images]);

  return (
    <div ref={containerRef} className="w-full lg:w-[85%] mx-auto grid grid-cols-1 lg:grid-cols-3 relative h-[40vh] lg:h-[60vh] gap-4 lg:mt-4">
      {images && images.length > 0 ? (
        images.slice(0, 3).map((img, i) => (
          <div
            key={`visible-${i}`}
            className={`relative overflow-hidden lg:rounded-2xl cursor-pointer transition duration-300 hover:brightness-105 ${
              i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
            } ${(i === 0 || i === 2) ? 'hidden lg:block' : ''}`}
            onClick={() => lgRef.current?.openGallery(i)}
          >
            {/* <Image src={img} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" /> */}
            <CustomImg url={img} al="" styles="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" />
          </div>
        ))
      ) : (
        [...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`relative overflow-hidden lg:rounded-2xl bg-gray-100 ${
              i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
            } ${(i === 0 || i === 2) ? 'hidden lg:block' : ''}`}
          >
            <Image src={IMAGES.placeholder} height={500} width={500} alt="" className="h-full w-full object-cover opacity-20" />
          </div>
        ))
      )}

      <div className="hidden">
        {images.map((img, i) => (
          <a key={`lg-${i}`} href={img}>
            <Image src={img} width={1} height={1} alt="" />
          </a>
        ))}
      </div>
      {images && images.length > 0 && (
        <div className="absolute bottom-2 lg:bottom-4 right-2 lg:right-4 p-1 lg:p-2 px-2 lg:px-4 border border-white rounded-full flex-center-jc gap-2 backdrop-blur-sm bg-white/10 text-white pointer-events-none text-xs lg:text-sm">
          <Images size={12} /> {t('detail.viewAllImages')}
        </div>
      )}
    </div>
  );
}

function PackageImagesLoading() {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 relative h-[40vh] lg:h-[60vh] gap-4">
      <Skeleton className="lg:col-span-2 lg:row-span-2 rounded-2xl" />
      <Skeleton className="hidden lg:block rounded-2xl" />
      <Skeleton className="hidden lg:block rounded-2xl" />
      <div className="absolute bottom-2 lg:bottom-4 right-2 lg:right-4 p-1 lg:p-2 px-2 lg:px-4 rounded-full bg-white/10 backdrop-blur-sm">
        <Skeleton className="h-5 w-28" />
      </div>
    </div>
  );
}

function ItineraryDay({ itinerary, index, day, title, description, accommodation_metadata, activity_metadata, location_metadata }) {
  const first = index === 0;
  const last = itinerary.length === index + 1;
  const [expanded, setExpanded] = useState(false);
  const showMore = description?.length > 500;
  const [detailBlock,setDetailBlock] = useState(null)
  const { showDialog, hideDialog, dialog } = usePopup({
      form: detailBlock,
      container_styles: 'max-w-[800px]'
    });
  const { t } = useTranslation();

  return (
    <div className="relative ml-8">
    {dialog}
      <div className={`w-[32px] flex flex-col items-center justify-start absolute -left-10 ${first ? 'top-0 h-[116%]' : last ? 'top-2 md:top-3 lg:top-4' : 'top-2 md:top-3 lg:top-5 h-full'}`}>
        {first || last ? <MapPin color="#fb3d3d" /> : <div className="h-5 aspect-square border-dashed border border-red rounded-full flex-center-jc"><div className="h-3 aspect-square bg-red rounded-full" /></div>}
        {!last && <div className="h-full flex-1 w-1 border-dashed border-r border-red -ml-1"></div>}
      </div>

      <div className={`${first ? '' : 'pt-2 md:pt-4'} pb-2 md:pb-4 ${last ? '' : 'border-b border-gray-100'}`}>
        <p className="font-medium lg:text-xl mb-2 lg:mb-3">
          <span className="text-red">{`Day ${day} - `}</span>
          {title}
        </p>
        <div className={`transition-all duration-300 ${expanded ? 'h-auto' : 'max-h-[80px] overflow-hidden'}`}>
          <p className="text-xs lg:text-sm text-gray-600 mt-1">{expanded ? description : `${description?.slice(0, 500)}${description?.length > 500 ? '...' : ''}`}</p>
        </div>
        {showMore && (
          <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-gray-400 hover:text-gray-600 mt-1">
            {expanded ? t('detail.showLess') : t('detail.showMore')}
          </button>
        )}

        {location_metadata?.length > 0 && (
          <div className="mt-4">
            <p className="font-medium text-lg mb-2">{t('detail.locations')}</p>
            <div className="flex gap-2 overflow-x-auto pb-2">{location_metadata.map((l, i) => <MetaDataBlock key={i} {...l} type="location"  fun={()=>{
              setDetailBlock(<DetailBlock id={l.id || null} type="LOCATIONS"/>)
              showDialog()
            }}/>)}</div>
          </div>
        )}
        {activity_metadata?.length > 0 && (
          <div className="mt-4">
            <p className="font-medium text-lg mb-2">{t('detail.activities')}</p>
            <div className="flex gap-2 overflow-x-auto pb-2">{activity_metadata.map((a, i) => <MetaDataBlock key={i} {...a} type="activity" fun={()=>{
              setDetailBlock(<DetailBlock id={a.id || null} type="ACTIVITIES"/>)
              showDialog()
            }}/>)}</div>
          </div>
        )}
        {accommodation_metadata?.length > 0 && (
          <div className="mt-4">
            <p className="font-medium text-lg mb-2">{t('detail.accommodations')}</p>
            <div className="flex gap-2 overflow-x-auto pb-2">{accommodation_metadata.map((acc, i) => <MetaDataBlock key={i} {...acc} type="accommodation" fun={()=>{
              setDetailBlock(<DetailBlock id={acc.id || null} type="ACCOMMODATIONS"/>)
              showDialog()
            }} />)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetaDataBlock({ name, description, img, type, fun }) {
  return (
    <div role="button" className="shrink-0 w-32 md:w-36 lg:w-40 cursor-pointer" onClick={fun || null}>
      <div className="rounded-xl overflow-hidden shadow border border-gray-100 hover:shadow-lg transition">
        <div className="h-20 lg:h-24 flex-center-jc overflow-hidden">
          {img ? <Image src={img} alt={name} height={200} width={200} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gray-200" />}
        </div>
        <div className="p-2">
          <p className="text-xs md:text-sm font-medium truncate">{name}</p>
          <p className="text-[8px] lg:text-[10px] text-gray-500 line-clamp-2">{description?.slice(0, 100)}{description?.length > 100 ? '...' : ''}</p>
        </div>
      </div>
    </div>
  );
}

function ExpenseSection(props){
  const {expenses} = props
  const { currency } = useCurrency();
  const { t } = useTranslation();
  return(
    <>
    {expenses.length > 0 && (
        <section id="optional_addons" className="space-y-6">
          <h2 className="text-lg font-medium lg:text-3xl mb-4">
            {t('detail.optionalAddons')}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xl shadow-gray-100/50 hover:shadow transition"
              >
                <h3 className="text-sm md:text-base font-medium text-gray-900 mb-2">
                  {exp.title}
                </h3>

                <p className="text-xs text-gray-600 mb-2 line-clamp-3">
                  {exp.description}
                </p>

                <div className="flex items-center justify-start gap-2">
                  <span className="text-lg font-medium text-red">
                    {formatNumber(exp.cost, currency)}
                  </span>
                  <span className="text-xs text-gray-500">{t('common.perPerson')}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
