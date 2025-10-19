import React from 'react';
import clsx from 'clsx';
import {Link} from '~/components/Link';

// Define props interface based on Liquid schema settings
interface TopBarSettings {
  section_width: 'container' | 'fluid_container' | 'stretch_width' | 'full_width';
  color_scheme: string; // Assuming this maps to a CSS class
  show_mobile?: boolean;
  show_separator_line?: boolean;
  uppercase?: boolean;
  font_size?: number;
  font_weight?: 'body_weight' | 'heading_weight' | 'subheading_weight';
  padding_top?: number;
  padding_bottom?: number;
}

interface TopBarBlockSettings {
  hidden_on_mobile?: boolean;
}

interface StoreInformationBlockSettings extends TopBarBlockSettings {
  show_email?: boolean;
  show_phone?: boolean;
}

interface TextBlockSettings extends TopBarBlockSettings {
  text?: string;
}

interface TextSliderBlockSettings extends TopBarBlockSettings {
  text1?: string;
  text2?: string;
  text3?: string;
  change_every?: number;
}

interface CurLangBlockSettings extends TopBarBlockSettings {
  menu_link?: any; // This will be a Hydrogen LinkList object
  show_currency?: boolean;
  show_language?: boolean;
  show_our_store?: boolean;
}

interface TopBarBlock {
  id: string;
  type: 'store_information' | 'socials' | 'text' | 'text_slider' | 'cur_lang';
  settings: TopBarBlockSettings | StoreInformationBlockSettings | TextBlockSettings | TextSliderBlockSettings | CurLangBlockSettings;
}

interface TopBarProps {
  settings: TopBarSettings;
  blocks: TopBarBlock[];
  // Assuming these are passed from a loader or context
  storeEmail?: string;
  storePhone?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
    pinterest?: string;
    vimeo?: string;
    linkedin?: string;
    whatsapp?: string;
    tumblr?: string;
    snapchat?: string;
  };
  storePage?: any; // Hydrogen Page object
  storeAddress?: string;
}

export function TopBar({ settings, blocks, storeEmail, storePhone, socialLinks, storePage, storeAddress }: TopBarProps) {
  const { section_width, color_scheme, show_mobile, show_separator_line, uppercase, font_size, font_weight, padding_top, padding_bottom } = settings;

  const sectionClasses = clsx(
    'topbar gradient',
    padding_top < 30 && 'pt-min',
    padding_bottom < 30 && 'pb-min',
    'section remove_spacing',
    `color-${color_scheme}`,
    !show_mobile && 'hidden block-1025', // Assuming block-1025 means hidden on mobile for larger screens
    show_separator_line && 'border-bottom',
    uppercase && 'uppercase'
  );

  const sectionStyles = {
    '--section-pt': `${padding_top}px`,
    '--section-pb': `${padding_bottom}px`,
    '--swiper-navigation-color': 'var(--color-text)',
    '--font-size': `${font_size}px`,
  } as React.CSSProperties;

  const hiddenBlock = blocks.some(block => (block.settings as TopBarBlockSettings).hidden_on_mobile === false);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div id="topbar" className={sectionClasses} style={sectionStyles}>
      <div className={section_width}>
        <div
          className={clsx(
            'flex flex-wrap flex-md-nowrap gap justify-center justify-between-1025 align-center topbar__section-inner gap-10 gap-lg-25 fs-custom',
            font_weight
          )}
        >
          {blocks.map(block => {
            const blockSettings = block.settings as TopBarBlockSettings;
            const hiddenOnMobileClass = blockSettings.hidden_on_mobile ? 'hidden flex-1025' : '';

            switch (block.type) {
              case 'store_information':
                const storeInfoSettings = block.settings as StoreInformationBlockSettings;
                if (storeInfoSettings.show_email && storeEmail || storeInfoSettings.show_phone && storePhone) {
                  return (
                    <div key={block.id} className={clsx('topbar-item', hiddenOnMobileClass, 'gap-10', 'flex')}>
                      {storeInfoSettings.show_phone && storePhone && (
                        <a className="no-underline" href={`tel:${storePhone}`} aria-label={storePhone}>
                          <span>{storePhone}</span>
                        </a>
                      )}
                      {storeInfoSettings.show_email && storeEmail && (
                        <a className="no-underline" href={`mailto:${storeEmail}`} aria-label={storeEmail}>
                          <span>{storeEmail}</span>
                        </a>
                      )}
                    </div>
                  );
                }
                return null;

              case 'socials':
                // Assuming socialLinks object is passed with boolean flags or URLs
                const hasSocials = Object.values(socialLinks || {}).some(link => !!link);
                if (hasSocials) {
                  return (
                    <div key={block.id} className={clsx('topbar-item', hiddenOnMobileClass)}>
                      {/* Render social icons component here */}
                      {/* For now, a placeholder */}
                      <span>Social Icons Placeholder</span>
                    </div>
                  );
                }
                return null;

              case 'text':
                const textSettings = block.settings as TextBlockSettings;
                if (textSettings.text) {
                  return (
                    <div key={block.id} className={clsx('topbar-item', hiddenOnMobileClass)}>
                      <div className="topbar-message" dangerouslySetInnerHTML={{ __html: textSettings.text }}></div>
                    </div>
                  );
                }
                return null;

              case 'text_slider':
                const textSliderSettings = block.settings as TextSliderBlockSettings;
                const texts = [textSliderSettings.text1, textSliderSettings.text2, textSliderSettings.text3].filter(Boolean);
                if (texts.length > 0) {
                  return (
                    <div key={block.id} className={clsx('topbar-item w-full text-slide', hiddenOnMobileClass)}>
                      {/* Swiper integration would go here */}
                      {/* For now, a simple display of the first text */}
                      <span>Text Slider Placeholder: {texts[0]}</span>
                    </div>
                  );
                }
                return null;

              case 'cur_lang':
                const curLangSettings = block.settings as CurLangBlockSettings;
                // Assuming country-switcher and language-switcher are separate components
                // and menu_link is handled via Hydrogen's LinkList
                return (
                  <div key={block.id} className={clsx('lang__currency-desktop justify-content-center justity-md-unset topbar-item', hiddenOnMobileClass, 'flex flex-wrap gap-10 gap-lg-25 align-center row-gap-0')}>
                    {curLangSettings.menu_link && (
                      <ul className="linklist list-unstyled flex flex-wrap gap-10 gap-lg-25">
                        {curLangSettings.menu_link.links.map((link: any) => (
                          <li key={link.title}>
                            <Link className="no-underline block" to={link.url} aria-label={link.title}>
                              {link.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    {curLangSettings.show_our_store && storePage && storeAddress && (
                      <Link
                        to={storePage.url || '#'}
                        aria-label={storeAddress}
                        className="no-underline"
                      >
                        <span>{storeAddress}</span>
                      </Link>
                    )}
                    {curLangSettings.show_currency && <span>Currency Switcher Placeholder</span>}
                    {curLangSettings.show_language && <span>Language Switcher Placeholder</span>}
                  </div>
                );

              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}
