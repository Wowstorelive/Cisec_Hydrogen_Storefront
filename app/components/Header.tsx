import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Link } from '~/components/Link';
import { useLocation } from '@remix-run/react';

// Define props interface based on Liquid schema settings
interface HeaderSettings {
  section_width: 'container' | 'fluid_container' | 'stretch_width' | 'full_width';
  color_scheme: string;
  show_email?: boolean;
  show_phone?: boolean;
  enable_login_popup?: boolean;
  separator_line?: 'unset' | 'homepage' | 'inner_page' | 'all-page';
  sticky_header_type?: 'none' | 'on-scroll-up' | 'always';
  sticky_header_mobile?: boolean;
  mega_menu?: any; // LinkList
  dropdowns_animation?: 'fade-in' | 'fade-in-down' | 'down-to-up';
  uppercase_first?: boolean;
  hot?: string; // Menu label text
  label_color_hot?: string;
  label_background_hot?: string;
  new?: string;
  label_color_new?: string;
  label_background_new?: string;
  sale?: string;
  label_color_sale?: string;
  label_background_sale?: string;
  popular?: string;
  label_color_popular?: string;
  label_background_popular?: string;
  redirect_to_link?: boolean;
  menu_mobile_color?: string;
  menu_mobile_background?: string;
  show_search?: boolean;
  show_account_icon?: boolean;
  show_wishlist_icon?: boolean;
  show_shopping_cart?: boolean;
  show_currency?: boolean;
  show_language?: boolean;
  show_recently_viewed?: boolean;
  padding_top?: number;
  padding_bottom?: number;
}

interface HeaderBlockSettings {
  // Define block-specific settings if needed
}

interface HeaderProps {
  settings: HeaderSettings;
  // Assuming these are passed from a loader or context
  pageType?: string; // e.g., 'index', 'product', etc.
  enableCatalogMode?: boolean; // From theme settings
  storeEmail?: string;
  storePhone?: string;
  // Add props for menu, social links, etc. as needed
}

export function Header({ settings, pageType, enableCatalogMode, storeEmail, storePhone }: HeaderProps) {
  const { 
    section_width, 
    color_scheme, 
    separator_line, 
    sticky_header_type, 
    sticky_header_mobile, 
    show_search, 
    show_account_icon, 
    show_wishlist_icon, 
    show_shopping_cart, 
    show_recently_viewed, 
    padding_top, 
    padding_bottom 
  } = settings;

  const location = useLocation();
  const isHomepage = location.pathname === '/';

  const headerClasses = clsx(
    'header relative gradient',
    `color-${color_scheme}`,
    separator_line === 'all-page' && 'border-bottom',
    (separator_line === 'homepage' && isHomepage) && 'border-bottom',
    (separator_line === 'inner_page' && !isHomepage) && 'border-bottom',
    'popup-search-mobile'
  );

  const headerStyles = {
    '--section-pt': `${padding_top}px`,
    '--section-pb': `${padding_bottom}px`,
  } as React.CSSProperties;

  // Placeholder for sticky header logic
  const [isSticky, setIsSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      // Implement sticky logic based on sticky_header_type and sticky_header_mobile
      // For now, a simple example:
      if (sticky_header_type !== 'none') {
        setIsSticky(window.scrollY > 100); // Example threshold
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky_header_type]);

  return (
    <header
      className={clsx(headerClasses, isSticky && 'sticky-header')}
      style={headerStyles}
      data-sticky={sticky_header_type}
      data-sticky-mobile={sticky_header_mobile}
    >
      <div className="header__inner header__layout-3" id="header-sticky">
        <div className="header-top__actions">
          <div className="${section_width}">
            <div className="header-mega-store logo-position relative z-1 z-1025-16 section flex logo-center gap-10 header-middle align-center justify-between hidden-sticky">
              <div className="block hidden-1025">
                {/* Toggle Menu Component */}
                <span>Mobile Menu Toggle Placeholder</span>
              </div>
              <div className="inline-flex align-center col-logo">
                {/* Logo Component */}
                <span>Logo Placeholder</span>
              </div>
              <div className="header-search header-search__mega color-default flex-1">
                {show_search && (
                  <span>Search Header Placeholder</span>
                )}
              </div>
              <div className="header__action flex flex-end align-center">
                {/* SVG Symbols for icons */}
                <svg hidden>
                  <symbol id="icon-wishlist-header">
                    <path d="M17.4693 1.46278C16.4831 0.52335 15.178 0 13.8216 0C12.4652 0 11.1601 0.52335 10.1739 1.46278L9.5 2.11096L8.8261 1.46278C7.84238 0.51698 6.53343 -0.00720742 5.17448 0.000442952C3.81807 -0.00598466 2.512 0.518175 1.53069 1.46278C1.04762 1.9183 0.662488 2.46909 0.399178 3.08097C0.135869 3.69285 0 4.35278 0 5.01983C0 5.68687 0.135869 6.3468 0.399178 6.95868C0.662488 7.57057 1.04762 8.12135 1.53069 8.57687L8.96715 15.7858C9.04006 15.8502 9.12189 15.9034 9.21006 15.9439C9.39624 16.0187 9.60376 16.0187 9.78994 15.9439C9.87811 15.9034 9.95994 15.8502 10.0329 15.7858L17.4693 8.57687C17.9524 8.12135 18.3375 7.57057 18.6008 6.95868C18.8641 6.3468 19 5.68687 19 5.01983C19 4.35278 18.8641 3.69285 18.6008 3.08097C18.3375 2.46909 17.9524 1.9183 17.4693 1.46278ZM17.4693 5.00402C17.4715 5.47163 17.3796 5.93483 17.1991 6.36555C17.0186 6.79627 16.7533 7.18553 16.4193 7.50976L9.5 14.2286L2.58856 7.50976C2.24936 7.18822 1.97903 6.80001 1.79425 6.36906C1.60946 5.93811 1.51413 5.47355 1.51413 5.00402C1.51413 4.53448 1.60946 4.06992 1.79425 3.63897C1.97903 3.20802 2.24936 2.81981 2.58856 2.49828C3.28454 1.82749 4.21191 1.45613 5.17448 1.46278C6.14183 1.45534 7.07438 1.82652 7.77606 2.49828L8.96715 3.66025C9.04006 3.72459 9.12189 3.77785 9.21006 3.81834C9.39624 3.89313 9.60376 3.89313 9.78994 3.81834C9.87811 3.77785 9.95994 3.72459 10.0329 3.66025L11.2318 2.49828C11.9277 1.82749 12.8551 1.45613 13.8177 1.46278C14.785 1.45534 15.7176 1.82652 16.4193 2.49828C16.7562 2.82115 17.0244 3.20981 17.2076 3.64059C17.3908 4.07137 17.4852 4.53526 17.485 5.00402H17.4693Z" fill="currentColor"/>
                  </symbol>
                  <symbol id="icon-recently-view">
                    <path d="M16.99 8.495C16.99 7.91538 16.9357 7.34784 16.827 6.79238C16.7062 6.23691 16.5372 5.7056 16.3198 5.19843C16.1145 4.69127 15.8549 4.20826 15.541 3.74939C15.2391 3.29053 14.8949 2.86789 14.5085 2.48148C14.1221 2.10715 13.6995 1.763 13.2406 1.44904C12.7938 1.14716 12.3168 0.887537 11.8097 0.670181C11.3025 0.452825 10.7712 0.289808 10.2157 0.18113C9.66027 0.0603767 9.08669 0 8.495 0C7.90331 0 7.32973 0.0603767 6.77426 0.18113C6.2188 0.289808 5.68748 0.452825 5.18032 0.670181C4.67316 0.887537 4.19618 1.14716 3.74939 1.44904C3.29053 1.763 2.86789 2.10715 2.48148 2.48148C2.09507 2.86789 1.75092 3.29053 1.44904 3.74939C1.13508 4.20826 0.869424 4.69127 0.652068 5.19843C0.446787 5.7056 0.28377 6.23691 0.163017 6.79238C0.054339 7.34784 0 7.91538 0 8.495C0 9.08669 0.054339 9.66027 0.163017 10.2157C0.28377 10.7712 0.446787 11.3025 0.652068 11.8097C0.869424 12.3168 1.13508 12.7999 1.44904 13.2587C1.75092 13.7055 2.09507 14.1221 2.48148 14.5085C2.86789 14.8949 3.29053 15.2391 3.74939 15.541C4.19618 15.8549 4.67316 16.1206 5.18032 16.3379C5.68748 16.5553 6.2188 16.7183 6.77426 16.827C7.32973 16.9477 7.90331 17.0081 8.495 17.0081C9.08669 17.0081 9.66027 16.9477 10.2157 16.827C10.7712 16.7183 11.3025 16.5553 11.8097 16.3379C12.3168 16.1206 12.7938 15.8549 13.2406 15.541C13.6995 15.2391 14.1221 14.8949 14.5085 14.5085C14.8949 14.1221 15.2391 13.7055 15.541 13.2587C15.8549 12.7999 16.1145 12.3168 16.3198 11.8097C16.5372 11.3025 16.7062 10.7712 16.827 10.2157C16.9357 9.66027 16.99 9.08669 16.99 8.495ZM15.4504 8.495C15.4504 9.46103 15.2693 10.3667 14.907 11.212C14.5447 12.0572 14.0497 12.7938 13.4217 13.4217C12.7817 14.0497 12.0391 14.5447 11.1938 14.907C10.3606 15.2693 9.46103 15.4504 8.495 15.4504C7.52897 15.4504 6.62332 15.2693 5.77805 14.907C4.94485 14.5447 4.20826 14.0497 3.56826 13.4217C2.94034 12.7938 2.44526 12.0572 2.083 11.212C1.72074 10.3667 1.53961 9.46103 1.53961 8.495C1.53961 7.54105 1.72074 6.64144 2.083 5.79616C2.44526 4.95089 2.94034 4.21429 3.56826 3.58638C4.20826 2.95846 4.94485 2.46337 5.77805 2.10111C6.62332 1.72677 7.52897 1.53961 8.495 1.53961C9.46103 1.53961 10.3606 1.72677 11.1938 2.10111C12.0391 2.46337 12.7817 2.95846 13.4217 3.58638C14.0497 4.21429 14.5447 4.95089 14.907 5.79616C15.2693 6.64144 15.4504 7.54105 15.4504 8.495ZM7.71614 3.85807V8.495C7.71614 8.65198 7.75237 8.79085 7.82482 8.9116C7.90935 9.03235 8.01802 9.12292 8.15085 9.1833L11.2482 10.741C11.4293 10.8376 11.6225 10.8557 11.8278 10.7954C12.0331 10.7229 12.184 10.5901 12.2806 10.3969C12.3772 10.2037 12.3893 10.0044 12.3168 9.79914C12.2565 9.59386 12.1297 9.44291 11.9365 9.34631L9.27386 8.02406V3.85807C9.27386 3.65279 9.19537 3.4777 9.03839 3.33279C8.89349 3.17581 8.71236 3.09732 8.495 3.09732C8.27764 3.09732 8.09048 3.17581 7.9335 3.33279C7.78859 3.4777 7.71614 3.65279 7.71614 3.85807Z"/>
                  </symbol>
                  <symbol id="icon-search">
                    <path d="M11.9 11.731C11.8 11.731 11.8 11.731 11.9 11.731C11.8 11.8304 11.8 11.8304 11.8 11.8304C11.3 12.3275 10.7 12.7251 9.9 13.0234C9.2 13.3216 8.4 13.4211 7.6 13.4211C6.8 13.4211 6.8 13.2222 5.3 12.924C4.6 12.6257 4 12.2281 3.4 11.6316C2.9 11.1345 2.4 10.4386 2.1 9.74269C1.8 9.1462 1.7 8.45029 1.7 7.65497C1.7 6.85965 1.9 6.06433 2.2 5.36842C2.5 4.5731 2.9 3.97661 3.4 3.38012C4 2.88304 4.6 2.48538 5.3 2.18713C6 1.88889 6.8 1.69006 7.6 1.69006C8.4 1.69006 9.2 1.88889 9.9 2.18713C10.6 2.48538 11.3 2.88304 11.8 3.47953C12.3 3.97661 12.7 4.67251 13.1 5.36842C13.4 6.06433 13.6 6.76023 13.6 7.65497C13.6 8.45029 13.4 9.24561 13.1 9.94152C12.8 10.538 12.4 11.1345 11.9 11.731ZM16.7 15.4094L13.6 12.3275C14.1 11.6316 14.5 10.9357 14.8 10.1404C15.1 9.34503 15.2 8.45029 15.2 7.55556C15.2 6.46199 15 5.46784 14.6 4.5731C14.2 3.67836 13.7 2.88304 13 2.18713C12.3 1.49123 11.5 0.994152 10.6 0.596491C9.7 0.19883 8.7 0 7.6 0C6.6 0 5.6 0.19883 4.6 0.596491C3.7 0.994152 2.9 1.49123 2.2 2.18713C1.5 2.88304 1 3.67836 0.6 4.67251C0.2 5.56725 0 6.5614 0 7.65497C0 8.64912 0.2 9.64327 0.6 10.6374C1 11.5322 1.6 12.3275 2.3 13.0234C3 13.7193 3.8 14.2164 4.7 14.7134C5.6 15.0117 6.6 15.2105 7.6 15.2105C8.5 15.2105 9.4 15.1111 10.2 14.8129C11 14.5146 11.8 14.117 12.4 13.6199L15.5 16.7018C15.7 16.9006 15.9 17 16.1 17C16.3 17 16.5 16.9006 16.7 16.7018C16.9 16.5029 17 16.3041 17 16.1053C17 15.807 16.9 15.6082 16.7 15.4094Z"/>
                  </symbol>
                  <symbol id="icon-account">
                  <path fill="currentColor" d="M15.899 14.84a9.143 9.143 0 0 0-3.35-3.292 9.203 9.203 0 0 0-9.101 0 9.143 9.143 0 0 0-3.35 3.293.773.773 0 0 0 .067.855c.064.08.145.146.238.193a.784.784 0 0 0 .39.101.737.737 0 0 0 .671-.373 7.57 7.57 0 0 1 2.774-2.727 7.619 7.619 0 0 1 7.537 0 7.57 7.57 0 0 1 2.773 2.727.78.78 0 0 0 1.062.28.716.716 0 0 0 .36-.458.772.772 0 0 0-.071-.598ZM8 9.6a4.777 4.777 0 0 0 3.363-1.387A4.866 4.866 0 0 0 12.8 4.844a4.867 4.867 0 0 0-1.406-3.425A4.778 4.778 0 0 0 8 0C6.727 0 5.506.51 4.606 1.419A4.867 4.867 0 0 0 3.2 4.844a4.866 4.866 0 0 0 1.436 3.369A4.777 4.777 0 0 0 8 9.6ZM4.8 4.844c0-.856.337-1.678.937-2.283A3.185 3.185 0 0 1 8 1.615c.848 0 1.662.34 2.262.946a3.245 3.245 0 0 1 0 4.567c-.6.606-1.414.946-2.262.946-.849 0-1.663-.34-2.263-.946A3.245 3.245 0 0 1 4.8 4.844Z"/>
                    </symbol>
                </svg>
                {/* My Account Component */}
                {show_account_icon && (
                  <span>My Account Placeholder</span>
                )}
                {/* Wishlist Component */}
                {show_wishlist_icon && (
                  <span>Wishlist Placeholder</span>
                )}
                {/* Minicart Component */}
                {show_shopping_cart && !enableCatalogMode && (
                  <span>Minicart Placeholder</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="header-bottom__navigation color-default relative">
          <div className="${section_width}">
            <div className="header__menu border-top-1025 flex justify-between" style={{ '--section-pt': '0', '--section-pb': '0' }}>
              <div className="header__menu-nav">
                {/* Horizontal Menu Component */}
                <span>Horizontal Menu Placeholder</span>
              </div>
              <div className="header-information relative z-1 flex justify-between align-center fs-14">
                {show_recently_viewed && (
                  <span>Recently Viewed Placeholder</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
