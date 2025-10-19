import React from 'react';
import clsx from 'clsx';
import { Link } from '@remix-run/react';
// import Swiper core and required modules
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';

import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Define props interface based on Liquid schema settings
interface CollectionListSettings {
  section_width: 'container' | 'fluid_container' | 'stretch_width' | 'full_width';
  color_scheme: string;
  reset_spacing?: boolean;
  column_gap?: number;
  items_per_row_mobile?: number;
  heading?: string;
  description?: string;
  show_view_all_button?: boolean;
  show_arrow?: boolean;
  carousel_pagination?: 'disable' | 'show_dots' | 'show_dots_on_mobile' | 'show_progress_bar';
  collection_information_position?: 'overlay_image' | 'below_image';
  design?: 'default' | 'morden';
  infinite?: boolean;
  autoplay?: boolean;
  autorotate_speed?: number;
  reveal?: boolean;
  display_mode?: 'grid' | 'carousel';
  items_per_row?: number;
  header_size?: 'small' | 'medium' | 'large';
  rounded_image?: boolean;
  image_custom_width?: boolean;
  scroll_animation?: string; // Assuming this maps to a CSS class or animation type
  padding_top?: number;
  padding_bottom?: number;
}

interface CollectionBlockSettings {
  collection?: { // Simplified collection object
    id: string;
    handle: string;
    title: string;
    description?: string;
    imageUrl?: string;
    url?: string;
    productsCount?: number;
  };
  collection_image?: { // Hydrogen Image object
    url: string;
    altText?: string;
  };
  collection_title?: string;
}

interface CollectionListBlock {
  id: string;
  type: 'collection';
  settings: CollectionBlockSettings;
}

interface CollectionListProps {
  settings: CollectionListSettings;
  blocks: CollectionListBlock[];
  pageType?: string; // To determine if it's homepage
}

// Placeholder for CollectionItem component
import { Image } from '@shopify/hydrogen'; // Import Image component

function CollectionItem({ card_collection, section, block, collection_information_position, design }: any) {
  const collection = card_collection || block.settings.collection;
  const imageUrl = block.settings.collection_image?.url || collection?.imageUrl;
  const title = block.settings.collection_title || collection?.title;

  return (
    <div className="collection-item">
      {imageUrl && (
        <Link to={collection?.url || '#'}>
          <Image
            data={{ url: imageUrl, altText: title }}
            className="w-full h-auto"
            sizes="auto" // Adjust sizes as needed
          />
        </Link>
      )}
      <h3>{title}</h3>
      {collection_information_position === 'below_image' && collection?.description && (
        <p>{collection.description}</p>
      )}
      {collection?.productsCount > 0 && (
        <p className="product-count">{collection.productsCount} products</p>
      )}
    </div>
  );
}

export function CollectionList({ settings, blocks, pageType }: CollectionListProps) {
  const { 
    section_width, 
    color_scheme, 
    reset_spacing, 
    column_gap, 
    items_per_row_mobile, 
    heading, 
    description, 
    show_view_all_button, 
    show_arrow, 
    carousel_pagination, 
    collection_information_position, 
    design, 
    infinite, 
    autoplay, 
    autorotate_speed, 
    reveal, 
    display_mode, 
    items_per_row, 
    header_size, 
    rounded_image, 
    image_custom_width, 
    scroll_animation, 
    padding_top, 
    padding_bottom 
  } = settings;

  const isHomepage = pageType === 'index'; // Assuming pageType is passed

  const sectionClasses = clsx(
    'section',
    padding_top < 30 && 'pt-min',
    padding_bottom < 30 && 'pb-min',
    'sec__collection-list',
    `color-${color_scheme}`,
    reset_spacing && 'remove_spacing',
    reveal && 'overflow-hidden'
  );

  const sectionStyles = {
    '--section-pt': `${padding_top}px`,
    '--section-pb': `${padding_bottom}px`,
  } as React.CSSProperties;

  const colStyle = {
    '--col-desktop': items_per_row,
    '--col-number': items_per_row_mobile,
    '--col-tablet': items_per_row > 3 ? 3 : items_per_row,
    '--col-gap': column_gap < 15 ? `${column_gap}px` : '15px',
    '--col-gap-desktop': column_gap >= 15 ? `${column_gap}px` : undefined,
    '--repeat': blocks.length,
    '--col-mobile': items_per_row_mobile,
  } as React.CSSProperties;

  const headerSizeClass = clsx({
    'h3': header_size === 'small',
    'h1-size': header_size === 'large',
  });

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className={sectionClasses} style={sectionStyles}>
      <div className={section_width}>
        {(heading || description || show_view_all_button) && (
          <div className={clsx(
            'section__header mb-33 mb-sm-20',
            `text-${settings.header_alignment}`,
            section_width === 'full_width' && 'px-20',
            show_view_all_button && 'flex gap-15 gap-md-30 flex-wrap',
            settings.header_alignment === 'center' ? 'justify-content-center' : 'justify-between',
            'align-center',
            settings.header_alignment === 'right' && 'flex-row-reverse'
          )}>
            {(heading || description) && (
              <div className="secion__header-inner">
                {heading && (
                  <h2 className={clsx(
                    'section__header-heading heading-letter-spacing mt-0',
                    headerSizeClass,
                    description && 'mb-10'
                  )}>
                    {heading}
                  </h2>
                )}
                {description && (
                  <div className="section__header-des rich__text-m0" dangerouslySetInnerHTML={{ __html: description }}></div>
                )}
              </div>
            )}
            {show_view_all_button && settings.header_alignment !== 'center' && (
              <Link
                className="btn_view-all no-underline inline-flex btn-link"
                to={settings.collection?.url || '#'} // Assuming collection URL is available in settings
                aria-label="View all"
              >
                View all
              </Link>
            )}
          </div>
        )}

        {blocks.length > 0 && (
          display_mode === 'grid' ? (
            <div
              className={clsx(
                'collection-list--grid grid grid-cols gap',
                items_per_row_mobile > 1 && items_per_row_mobile < 3 && 'grid_scroll'
              )}
              style={colStyle}
            >
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  className={clsx(
                    'collection-item grid-custom-item',
                    scroll_animation !== 'none' && scroll_animation !== null && `scroll-trigger ${scroll_animation}`,
                    'hover_effect' // Assuming settings.hover_effect is a class
                  )}
                  style={{ '--animation-order': index }} // Placeholder for motion-element
                >
                  <CollectionItem
                    card_collection={block.settings.collection}
                    section={settings}
                    block={block}
                    collection_information_position={collection_information_position}
                    design={design}
                  />
                </div>
              ))}
            </div>
          ) : (
            // Carousel mode
            <Swiper
              modules={[Navigation, Pagination, A11y, Autoplay]}
              spaceBetween={column_gap}
              slidesPerView={items_per_row_mobile}
              loop={infinite}
              autoplay={autoplay ? { delay: autorotate_speed * 1000, disableOnInteraction: false } : false}
              navigation={show_arrow}
              pagination={carousel_pagination !== 'disable' && { clickable: true, type: carousel_pagination === 'show_progress_bar' ? 'progressbar' : 'bullets' }}
              breakpoints={{
                768: { // Tablet
                  slidesPerView: items_per_row > 5 ? 4 : (items_per_row > 4 ? 3 : (items_per_row > 3 ? 3 : items_per_row)),
                },
                1024: { // Desktop
                  slidesPerView: items_per_row,
                },
              }}
              className={clsx(
                'swiper',
                reveal && 'reveal_on_scroll'
              )}
              style={colStyle}
            >
              {blocks.map((block, index) => (
                <SwiperSlide key={block.id}>
                  <div
                    className={clsx(
                      'collection-item',
                      scroll_animation !== 'none' && scroll_animation !== null && `scroll-trigger ${scroll_animation}`,
                      'hover_effect' // Assuming settings.hover_effect is a class
                    )}
                    style={{ '--animation-order': index }} // Placeholder for motion-element
                  >
                    <CollectionItem
                      card_collection={block.settings.collection}
                      section={settings}
                      block={block}
                      collection_information_position={collection_information_position}
                      design={design}
                    />
                  </div>
                </SwiperSlide>
              ))}
              {show_arrow && (
                <div className="swiper-action gradient show-arrow static absolute-lg align-center left-0 inset-y-0 z-3 flex gap-20 pe-1025-25 pe-0">
                  <div className="swiper-button-prev original-style visible absolute left-10 static-lg-impo transform-md-none transition">
                    <svg width="6" height="11" fill="none"><use href="#icon-back" /></svg>
                  </div>
                  <div className="swiper-button-next original-style visible absolute right-10 static-lg-impo transform-md-none transition">
                    <svg width="6" height="11" fill="none"><use href="#icon-next" /></svg>
                  </div>
                </div>
              )}
              {carousel_pagination !== 'disable' && (
                <div className={clsx(
                  'swiper-pagination flex flex-wrap px-15 lh-1 bottom-30 justify-content-center',
                  carousel_pagination === 'show_dots_on_mobile' && 'hidden-md'
                )} style={{ '--swiper-pagination-bottom': '3rem', '--swiper-pagination-position': 'static', 'z-index': 2 }}></div>
              )}
            </Swiper>
          )
        )}
      </div>
    </div>
  );
}
