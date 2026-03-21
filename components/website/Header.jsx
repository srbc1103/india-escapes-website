'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Globe, DollarSign, ChevronDown, ChevronUp, Facebook, Instagram, TwitterIcon, MessageCircle, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { COLLECTIONS, CURRENCIES, IMAGES, LANGUAGES } from '../../constants';
import { useFetchList, useRegions } from '../../hooks/useFetch';
import Data from '../../lib/backend';
import { useCurrency } from '../../context/CurrencyContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

import { Popover, PopoverContent, PopoverTrigger} from "../ui/popover"

export default function Header({
  color = { mobile: 'black', desktop: 'black' },
  fixed = { mobile: false, desktop: false },
  styles,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { t } = useTranslation();

  const colorConfig = {
    mobile: color?.mobile ?? color ?? 'white',
    desktop: color?.desktop ?? color ?? 'black',
  };

  const fixedConfig = {
    mobile: fixed?.mobile ?? fixed ?? true,
    desktop: fixed?.desktop ?? fixed ?? false,
  };

  function toggleMenu() {
    document.querySelector('.ms_menu_wrap')?.classList.toggle('show');
  }

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Only apply scroll logic if ANY fixed mode is true
    if (!fixedConfig.mobile && !fixedConfig.desktop) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      setScrolled(scrollY > 0.2 * viewportHeight);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fixedConfig.mobile, fixedConfig.desktop]);

  // Determine current color & fixed state based on screen size
  const currentColor = isDesktop ? colorConfig.desktop : colorConfig.mobile;
  const isFixed = isDesktop ? fixedConfig.desktop : fixedConfig.mobile;

  const logoSrc =
    currentColor === 'white'
      ? scrolled && isFixed
        ? IMAGES.logo
        : IMAGES.logo_white
      : IMAGES.logo;

  return (
    <>
      <div
        className={cn(
          'nav transition duration-1000 z-20',
          isFixed
            ? 'fixed top-0 w-[100vw] left-0 h-auto'
            : 'relative',
          scrolled && isFixed && 'bg-white shadow-md',
          styles
        )}
      >
        <div className="flex items-center justify-between p-4 lg:p-6">
          {/* Left Side - Currency & Language (Desktop Only) */}
          <div className="flex items-center justify-start gap-2 w-[40%]">
            <div className="hidden lg:flex items-center gap-2">
              <CurrencyLanguageSelector
                colorConfig={colorConfig}
                isDesktop={isDesktop}
                scrolled={scrolled}
                isFixed={isFixed}
              />
            </div>
          </div>

          {/* Center - Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="">
              <Image
                src={logoSrc}
                className="h-8 lg:h-12 w-auto"
                alt="Logo"
              />
            </Link>
          </div>

          {/* Right Side - Trip Types, Destinations, Deals, Contact, Menu */}
          <div className="flex gap-2 items-center justify-end w-[40%]">
            {/* Desktop: Trip Types & Destinations */}
            <div className="hidden lg:flex items-center gap-2">
              <DesktopMenus
                colorConfig={colorConfig}
                isDesktop={isDesktop}
                scrolled={scrolled}
                isFixed={isFixed}
              />
            </div>

            {/* Contact Link */}
            <ul
              className={cn(
                'navUl flex flex-col items-start justify-start list-none lg:flex-row lg:items-center lg:justify-end lg:text-base',
                // Text color logic
                (!isDesktop && colorConfig.mobile === 'white' && !scrolled) ||
                (isDesktop && colorConfig.desktop === 'white' && !scrolled && isFixed)
                  ? 'lg:text-white'
                  : 'lg:text-black'
              )}
            >
              <li className="navLi">
                <Link href="/contact" className="p-3 px-6 rounded-xl transition duration-500 hover:underline">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>

            {/* Mobile Menu Button */}
            <button type="button" className="lg:hidden" onClick={toggleMenu}>
              <Menu size={20} color={scrolled && isFixed ? 'black' : currentColor} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer (Bottom) */}
      <MobileMenuDrawer
        colorConfig={colorConfig}
        isDesktop={isDesktop}
        scrolled={scrolled}
        isFixed={isFixed}
        toggleMenu={toggleMenu}
      />
    </>
  );
}

// Currency and Language Selector for Desktop Left Side
function CurrencyLanguageSelector({ colorConfig, isDesktop, scrolled, isFixed }) {
  const { currency, changeCurrency } = useCurrency();
  const { language, changeLanguage } = useLanguage();

  const headingColor = (() => {
    if (!isDesktop) {
      return colorConfig.mobile === 'white' && !scrolled ? 'text-white' : 'text-black';
    }
    return colorConfig.desktop === 'white' && !scrolled && isFixed
      ? 'text-white'
      : 'text-black';
  })();

  const currentCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const currentLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <div className="flex items-center justify-start gap-2">
      {/* Language Selector */}
      <Popover>
        <PopoverTrigger
          className={cn(
            "rounded-full flex items-center gap-1 border text-xs p-1 px-3 transition duration-300 hover:bg-white/10",
            headingColor,
            scrolled && isFixed
              ? 'border-gray-300 hover:border-gray-400'
              : 'border-white/50 hover:border-white'
          )}
        >
          <Globe size={14} />
          <span className="hidden md:inline">{currentLanguage.code.toUpperCase()}</span>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-2">
          <div className="flex flex-col gap-1">
            {LANGUAGES.map((lang, i) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={i}
                  onClick={() => changeLanguage(lang.code)}
                  className={cn(
                    'text-left p-2 px-3 rounded-lg text-sm transition duration-200 hover:bg-gray-100',
                    isSelected && 'bg-red/10 text-red font-medium hover:bg-red/20'
                  )}
                >
                  {lang.name}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Currency Selector */}
      <Popover>
        <PopoverTrigger
          className={cn(
            "rounded-full flex items-center gap-1 border text-xs p-1 px-3 transition duration-300 hover:bg-white/10",
            headingColor,
            scrolled && isFixed
              ? 'border-gray-300 hover:border-gray-400'
              : 'border-white/50 hover:border-white'
          )}
        >
          <DollarSign size={14} />
          <span>{currentCurrency.code}</span>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-2">
          <div className="flex flex-col gap-1">
            {CURRENCIES.map((curr, i) => {
              const isSelected = curr.code === currency;
              return (
                <button
                  key={i}
                  onClick={() => changeCurrency(curr.code)}
                  className={cn(
                    'text-left p-2 px-3 rounded-lg text-sm transition duration-200 hover:bg-gray-100 flex items-center justify-between',
                    isSelected && 'bg-red/10 text-red font-medium hover:bg-red/20'
                  )}
                >
                  <span>{curr.code}</span>
                  <span className="text-gray-500">{curr.symbol}</span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Desktop Menus for Trip Types and Destinations (Right Side)
function DesktopMenus({ colorConfig, isDesktop, scrolled, isFixed }) {
  const { loading: loadingCategories, list: categories } = useFetchList({
    collection_id: COLLECTIONS.CATEGORIES,
    useCache: true,
  });
  const { loading: loadingRegions, regions } = useRegions();
  const { loading: loadingDeals, list: deals } = useFetchList({
    collection_id: COLLECTIONS.DEALS,
    useCache: true,
  });
  const { t } = useTranslation();
  const [tripTypesOpen, setTripTypesOpen] = useState(false);
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const [dealsOpen, setDealsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const headingColor = (() => {
    if (!isDesktop) {
      return colorConfig.mobile === 'white' && !scrolled ? 'text-white' : 'text-black';
    }
    return colorConfig.desktop === 'white' && !scrolled && isFixed
      ? 'text-white'
      : 'text-black';
  })();

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.ms_menu_li')) {
        setTripTypesOpen(false);
        setDestinationsOpen(false);
        setDealsOpen(false);
        setSelectedRegion(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter active deals
  const activeDeals = deals.filter(deal => deal.active);

  return (
    <>
      {/* Trip Types - Click Based */}
      <div className="ms_menu_li text-sm relative">
        <span
          className={cn('text-base cursor-pointer', headingColor)}
          onClick={(e) => {
            e.stopPropagation();
            setTripTypesOpen(!tripTypesOpen);
            setDestinationsOpen(false);
            setDealsOpen(false);
            setSelectedRegion(null);
          }}
        >
          {t('nav.tripTypes')}
        </span>
        {tripTypesOpen && (
          <div className="submenu" onClick={(e) => e.stopPropagation()}>
            {!loadingCategories && categories.length > 0 && categories.map((cat, i) => (
              <Link
                key={i}
                href={`/categories/${cat.url}`}
                className="ms_menu_item"
                onClick={() => setTripTypesOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Destinations - Click Based */}
      <div className="ms_menu_li text-sm relative">
        <span
          className={cn('text-base cursor-pointer', headingColor)}
          onClick={(e) => {
            e.stopPropagation();
            setDestinationsOpen(!destinationsOpen);
            setTripTypesOpen(false);
            setDealsOpen(false);
            setSelectedRegion(null);
          }}
        >
          {t('nav.destinations')}
        </span>
        {destinationsOpen && (
          <div className="destinations-submenu" onClick={(e) => e.stopPropagation()}>
            {/* Destinations List (appears when a region is selected) - Shows on LEFT */}
            {selectedRegion && (
              <div className="destinations-list">
                <div className="p-3 space-y-1">
                  {selectedRegion.destinations.map((dest, i) => (
                    <Link
                      key={i}
                      href={`/destinations/${dest.url}`}
                      className="ms_menu_item flex items-center justify-between"
                      onClick={() => setDestinationsOpen(false)}
                    >
                      <span>{dest.name}</span>
                      {dest.packages && dest.packages.length > 0 && 
                        <span className="text-xs text-gray-500 ml-2">{dest.packages.length}</span>
                      }
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Regions List - Shows on RIGHT */}
            <div className="regions-list">
              <div className="p-3 space-y-1">
                {!loadingRegions && regions.length > 0 && regions.map((regionObj, idx) => {
                  const { region, destinations } = regionObj;
                  if (destinations.length === 0) return null;
                  return (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRegion(regionObj);
                      }}
                      className="ms_menu_item w-full text-left flex items-center justify-between"
                    >
                      <span className="font-medium">{region}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deals - Click Based */}
      <div className="ms_menu_li text-sm relative">
        <span
          className={cn('text-base cursor-pointer', headingColor)}
          onClick={(e) => {
            e.stopPropagation();
            setDealsOpen(!dealsOpen);
            setTripTypesOpen(false);
            setDestinationsOpen(false);
            setSelectedRegion(null);
          }}
        >
          {t('nav.deals')}
        </span>
        {dealsOpen && (
          <div className="submenu" onClick={(e) => e.stopPropagation()}>
            {!loadingDeals && activeDeals.length > 0 ? (
              activeDeals.map((deal, i) => (
                <Link
                  key={i}
                  href={`/deals/${deal.url}`}
                  className="ms_menu_item"
                  onClick={() => setDealsOpen(false)}
                >
                  {deal.name}
                </Link>
              ))
            ) : (
              <div className="p-3 text-sm text-gray-500">
                {loadingDeals ? 'Loading...' : 'No active deals'}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function MobileMenuDrawer({ colorConfig, isDesktop, scrolled, isFixed, toggleMenu }) {
  const { loading: loadingCategories, list: categories } = useFetchList({
    collection_id: COLLECTIONS.CATEGORIES,
    useCache: true,
  });
  const { loading: loadingRegions, regions } = useRegions();
  const { loading: loadingDeals, list: deals } = useFetchList({
    collection_id: COLLECTIONS.DEALS,
    useCache: true,
  });
  const { currency, changeCurrency } = useCurrency();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  // Accordion state
  const [accordionOpen, setAccordionOpen] = useState({
    tripTypes: false,
    destinations: false,
    deals: false,
  });

  const currentCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const currentLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  // Filter active deals
  const activeDeals = deals.filter(deal => deal.active);

  const toggleAccordion = (section) => {
    setAccordionOpen(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
      <div className="ms_menu_bg fixed inset-0 bg-black/10 backdrop-blur hidden lg:hidden" onClick={toggleMenu}></div>

      <div className="ms_menu_wrap fixed bg-white h-[70vh] overflow-y-auto bottom-[-100vh] left-0 w-[100vw] z-40 p-7 transition-all duration-300 lg:hidden rounded-t-2xl">
        <h1 className="text-2xl md:text-4xl font-semibold text-red mb-4">Menu</h1>
        {/* Currency and Language Selectors in Mobile */}
        <div className="flex items-center justify-start gap-2 mb-6">
          {/* Language Selector */}
          <Popover>
            <PopoverTrigger className="rounded-full flex items-center gap-1 border text-xs p-1 px-3 transition duration-300 border-gray-300 hover:border-gray-400">
              <Globe size={14} />
              <span>{currentLanguage.code.toUpperCase()}</span>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
              <div className="flex flex-col gap-1">
                {LANGUAGES.map((lang, i) => {
                  const isSelected = lang.code === language;
                  return (
                    <button
                      key={i}
                      onClick={() => changeLanguage(lang.code)}
                      className={cn(
                        'text-left p-2 px-3 rounded-lg text-sm transition duration-200 hover:bg-gray-100',
                        isSelected && 'bg-red/10 text-red font-medium hover:bg-red/20'
                      )}
                    >
                      {lang.name}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* Currency Selector */}
          <Popover>
            <PopoverTrigger className="rounded-full flex items-center gap-1 border text-xs p-1 px-3 transition duration-300 border-gray-300 hover:border-gray-400">
              <DollarSign size={14} />
              <span>{currentCurrency.code}</span>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-2">
              <div className="flex flex-col gap-1">
                {CURRENCIES.map((curr, i) => {
                  const isSelected = curr.code === currency;
                  return (
                    <button
                      key={i}
                      onClick={() => changeCurrency(curr.code)}
                      className={cn(
                        'text-left p-2 px-3 rounded-lg text-sm transition duration-200 hover:bg-gray-100 flex items-center justify-between',
                        isSelected && 'bg-red/10 text-red font-medium hover:bg-red/20'
                      )}
                    >
                      <span>{curr.code}</span>
                      <span className="text-gray-500">{curr.symbol}</span>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Trip Types Accordion */}
        <div className="mb-4 border-b border-gray-200">
          <button
            onClick={() => toggleAccordion('tripTypes')}
            className="w-full flex items-center justify-between p-1 py-3 text-lg font-medium hover:bg-gray-50 rounded-lg transition"
          >
            <span>{t('nav.tripTypes')}</span>
            {accordionOpen.tripTypes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {accordionOpen.tripTypes && (
            <div className="space-y-1 pb-3 px-3">
              {!loadingCategories && categories.length > 0 && categories.map((cat, i) => {
                return <Link
                  key={i}
                  href={`/categories/${cat.url}`}
                  className="block p-2 px-3 text-sm hover:bg-gray-100 rounded-lg transition"
                  onClick={toggleMenu}
                >
                  {cat.name}
                </Link>
              })}
            </div>
          )}
        </div>

        {/* Destinations Accordion */}
        <div className="mb-4 border-b border-gray-200">
          <button
            onClick={() => toggleAccordion('destinations')}
            className="w-full flex items-center justify-between p-1 py-3 text-lg font-medium hover:bg-gray-50 rounded-lg transition"
          >
            <span>{t('nav.destinations')}</span>
            {accordionOpen.destinations ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {accordionOpen.destinations && (
            <div className="pb-3 px-3">
              {!loadingRegions && regions.length > 0 && regions.map((regionObj, idx) => {
                const { region, destinations } = regionObj;
                if (destinations.length === 0) return null;
                return (
                  <div key={idx} className="mb-3 last:mb-0">
                    <h4 className="text-gray-900 mb-2 pb-1 font-semibold text-sm">
                      {region}
                    </h4>
                    <div className="space-y-1">
                      {destinations.map((dest, i) => (
                        <Link
                          key={i}
                          href={`/destinations/${dest.url}`}
                          className="block p-2 px-3 text-sm hover:bg-gray-100 rounded-lg transition"
                          onClick={toggleMenu}
                        >
                          {dest.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Deals Accordion */}
        <div className="mb-4 border-b border-gray-200">
          <button
            onClick={() => toggleAccordion('deals')}
            className="w-full flex items-center justify-between p-1 py-3 text-lg font-medium hover:bg-gray-50 rounded-lg transition"
          >
            <span>{t('nav.deals')}</span>
            {accordionOpen.deals ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {accordionOpen.deals && (
            <div className="space-y-1 pb-3 px-3">
              {!loadingDeals && activeDeals.length > 0 ? (
                activeDeals.map((deal, i) => (
                  <Link
                    key={i}
                    href={`/deals/${deal.url}`}
                    className="block p-2 px-3 text-sm hover:bg-gray-100 rounded-lg transition"
                    onClick={toggleMenu}
                  >
                    {deal.name}
                  </Link>
                ))
              ) : (
                <div className="p-2 px-3 text-sm text-gray-500">
                  {loadingDeals ? 'Loading...' : 'No active deals'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contact Link */}
        <div className="pt-2">
          <Link
            href="/contact"
            className="p-1 py-3 text-lg font-medium hover:bg-gray-100 rounded-lg transition flex items-center justify-between"
            onClick={toggleMenu}
          >
            {t('nav.contact')}
            <ChevronRight size={20} />
          </Link>
        </div>
        {/* <div className="my-6 flex items-center justify-start gap-2 rounded-2xl bg-white p-2 border">
          <div className="h-16 aspect-square rounded-full flex-center-jc">
            <Image src={IMAGES.call} height={200} width={200} alt="" className="h-[60%] object-contain" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">{t('detail.talkToExpert')}</p>
            <Link href="tel:+918091066115" className="font-semibold text-xl lg:text-2xl transition duration-500 hover:text-red">+91 80910 66115</Link>
          </div>
        </div> */}
        <div className="my-4">
          <Image src={IMAGES.logo} height={200} width={200} className="h-8 w-auto" alt="Logo"/>
          {/* <p className="text-sm my-2 mt-4 text-gray-600">
            📧 sales@indiaescapes.in<br/>
            📬 Top floor, Verma Building, Bhatakuffer Chowk, Sanjauli, Shimla, HP, India
          </p> */}
        </div>
        <div className="my-4">
          <ul className="flex items-center justify-start gap-2">
              <li className=""><Link target="_blank" href="https://www.facebook.com/Indiaescapes.in/" className="h-8 aspect-square border-red border rounded-full flex items-center justify-center transition duration-300 text-red hover:bg-red hover:text-white"><Facebook size={16}/></Link></li>
              <li className=""><Link  target="_blank" href={"https://www.instagram.com/india_escapes/"} className="h-8 aspect-square border-red border rounded-full flex items-center justify-center transition duration-300 text-red hover:bg-red hover:text-white"><Instagram size={16}/></Link></li>
              <li className=""><Link  target="_blank" href={"https://x.com/India_escapes"} className="h-8 aspect-square border-red border rounded-full flex items-center justify-center transition duration-300 text-red hover:bg-red hover:text-white"><TwitterIcon size={16}/></Link></li>
              <li className=""><Link  target="_blank" href={"https://wa.me/+918091066115"} className="h-8 aspect-square border-red border rounded-full flex items-center justify-center transition duration-300 text-red hover:bg-red hover:text-white"><MessageCircle size={16}/></Link></li>
          </ul>
        </div>
      </div>
    </>
  );
}