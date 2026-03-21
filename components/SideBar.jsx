'use client';

import Data from '../lib/backend';
import { Bed, ChevronDown, CircleQuestionMark, ClipboardList, Compass, DiamondPercent, FileText, Images, LayoutDashboard, List, LogOut, MapPin, PersonStanding, Rss, Settings, Sprout, Tag, TentTree, TextQuote } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SideBar() {
  const router = useRouter();

  const menu = [
    {
      name: 'dashboard',
      icon: <LayoutDashboard size={18} />,
      active_icon: <LayoutDashboard size={18} className="text-black" />,
      link: '/dashboard',
      submenu: [],
    },
    {
      name: 'trip types',
      icon: <TextQuote size={18} />,
      active_icon: <TextQuote size={18} className="text-black" />,
      submenu: [],
      link: '/categories',
    },
    {
      name: 'media',
      icon: <Images size={18} />,
      active_icon: <Images size={18} className="text-black" />,
      submenu: [],
      link: '/media',
    },
    {
      name: 'deals',
      icon: <DiamondPercent size={18} />,
      active_icon: <DiamondPercent size={18} className="text-black" />,
      submenu: [],
      link: '/deals',
    },
    {
      name: 'labels',
      icon: <Tag size={18} />,
      active_icon: <Tag size={18} className="text-black" />,
      submenu: [],
      link: '/labels',
    },
    {
      name: 'packages',
      icon: <TentTree size={18} />,
      active_icon: <TentTree size={18} className="text-black" />,
      submenu: [
        {name:'sightseeing',link:'/ie_cms/locations'},
        {name:'experiences',link:'/ie_cms/activities'},
        {name:'accommodations',link:'/ie_cms/accommodations'},
        {name:'labels',link:'/ie_cms/activity',hidden:true},
        {name:'labels',link:'/ie_cms/accommdation',hidden:true},
        {name:'labels',link:'/ie_cms/package',hidden:true},
        {name:'labels',link:'/ie_cms/location',hidden:true},
        {name:'labels',link:'/ie_cms/packages',hidden:true},
      ],
      link: "/packages",
    },
    {
      name: 'Regions',
      icon: <Compass size={18} />,
      active_icon: <Compass size={18} className="text-black" />,
      submenu: [
        {name:'destinations',link:'/ie_cms/destinations'},
        {name:'labels',link:'/ie_cms/regions',hidden:true},
        {name:'labels',link:'/ie_cms/region',hidden:true},
        {name:'labels',link:'/ie_cms/destination',hidden:true},
      ],
      link: "/regions",
    },
    {
      name: 'blogs',
      icon: <Rss size={18} />,
      active_icon: <Rss size={18} className="text-black" />,
      submenu: [],
      link: '/blogs',
    },
    {
      name: 'FAQs',
      icon: <CircleQuestionMark size={18} />,
      active_icon: <CircleQuestionMark size={18} className="text-black" />,
      submenu: [],
      link: '/faq',
    },
    {
      name: 'SEO Settings',
      icon: <Settings size={18} />,
      active_icon: <Settings size={18} className="text-black" />,
      submenu: [],
      link: '/settings',
    },
    {
      name: 'Featured Images',
      icon: <Images size={18} />,
      active_icon: <Images size={18} className="text-black" />,
      submenu: [],
      link: '/featured_images',
    }
  ];

  return (
    <>
      <span
        className="lg:hidden nav_bg"
        onClick={() => {
          document.querySelector('nav').classList.remove('show');
        }}
      ></span>
      <nav
        className={`nav z-20`}
      >
        <div className="flex flex-col justify-between">
          <div className="h-[89vh] overflow-auto">
            <div className="font-bold text-center h-16 flex-center justify-start border-b mb-2 pl-8 gap-2">
            <Image src="/logo.png" alt="logo" width={100} height={100} className='object-contain h-[70%] w-auto'/>
              {/* <h1 className='my-8 py-4 text-black text-xl'>India Escapes!</h1> */}
            </div>
            <div className="relative overflow-y-auto p-4 pr-0">
              {menu.map((item, index) => (
                <MenuItem {...item} key={index} index={index} />
              ))}
            </div>
          </div>
          <div className={`transition duration-300 flex items-center justify-between gap-2 p-4 rounded-xl hover:bg-black/5 capitalize m-4 my-0 cursor-pointer`} role='button' onClick={async()=>{
            let cnf = confirm('Do you really want to log out?')
            if(!cnf) return
            await Data.logOut()
            router.replace('/ie_cms/auth')
          }}>
            <div className='flex items-center justify-start gap-2 text-lg md:text-base'>
              <LogOut size={18}/>
              <span>Log Out</span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

function MenuItem(props) {
  const { name, icon, active_icon, link, submenu, index } = props;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter()

  useEffect(() => {
    setOpen(submenu.length !== 0 ? submenu.find((e) => e.link === pathname) : false);
  }, [pathname, submenu]);

  if (submenu.length === 0) {
    const active = pathname == `/ie_cms${link}`;
    return (
      <Link
        href={`/ie_cms${link}`}
        className={`mb-1 transition duration-300 flex items-center justify-between gap-2 p-3 rounded-lg rounded-r-none ${
          active ? 'bg-white font-medium ' : 'hover:bg-white/50'
        } capitalize ${index === 0 ? '' : ''}`}
        onClick={()=>{
          document.querySelector('nav').classList.remove('show');
        }}
      >
        <div className="flex items-center justify-start gap-2 text-lg md:text-base">
          {active ? active_icon : icon}
          <span>{name}</span>
        </div>
      </Link>
    );
  }

  const active = submenu.length !== 0 ? submenu.find((e) => e.link === pathname) : false;
  return (
    <>
      <div className={`rounded-xl overflow-hidden ${open ? 'bg-white/50 shadow-xl' : ''} hover:bg-white/50 mb-2 mr-4`}>
        <div
          className={`transition duration-300 flex items-center justify-between gap-2 p-3 rounded-xl cursor-pointer ${
            active ? 'font-medium' : ''
          } capitalize mb-2 text-lg md:text-base`}
          role="button"
          onClick={() => {
            if(link){
              router.push(`/ie_cms/${link}`)
            }
            setOpen((o) => !o)
          }}
        >
          <div className="flex items-center justify-start gap-2">
            {active ? active_icon : icon}
            <span>{name}</span>
          </div>
          <div className={`grid items-center duration-200 transition ${open && 'menu_open'}`}>
            <ChevronDown className={`opacity-60 transition duration-300 ${open ? '-rotate-180' : ''}`} size={18} />
          </div>
        </div>
        <div
          className={`transition duration-1000 overflow-hidden -mt-4 pb-2`}
          style={{ height: open ? 'auto' : '0' }}
        >
          {submenu.map((item, index) => {
            if (item.hidden) return null;
            return (
              <Link
                href={item.link}
                className={`transition duration-300 flex items-center justify-between gap-2 p-3 pl-10 md:pl-[2.60rem] ${
                  pathname === item.link ? 'text-blue-blue1 font-medium' : 'hover:bg-gray-200 dark:hover:bg-black-black1'
                } capitalize text-sm`}
                key={index}
              >
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}