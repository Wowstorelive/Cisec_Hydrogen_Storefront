import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Link } from '@remix-run/react';
import { Image } from '@shopify/hydrogen';
// import Swiper core and required modules
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';

import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Reusing placeholders from InstagramShop for now
import { LookbookItem, ProductItem, ResponsiveImage } from './InstagramShop'; 

// Define props interface based on Liquid schema settings (similar to InstagramShop)
interface TiktokShopSettings {
  section_width: 'container' | 'fluid_container' | 'stretch_width' | 'full_width';
  color_scheme: string;
  reset_spacing?: boolean;
  column_gap?: number;
  items_per_row_mobile?: number;
  heading?: string;
  description?: string;
  header_size?: 'small' | 'medium' | 'large';
  header_alignment?: 'left' | 'center' | 'right';
  hotspot_style?: 'plus' | 'dot';
  image_ratio?: 'adapt' | 'square' | 'portrait' | 'landscape' | 'custom';
  custom_ratio?: string;
  items_per_row?: number;
  show_arrow?: boolean;
  carousel_pagination?: 'disable' | 'show_dots' | 'show_dots_on_mobile' | 'show_progress_bar';
  infinite?: boolean;
  autoplay?: boolean;
  autorotate_speed?: number;
  reveal?: boolean;
  scroll_animation?: string;
  padding_top?: number;
  padding_bottom?: number;
}

interface TiktokManualUploadBlockSettings {
  video?: { sources: { format: string; url: string }[]; preview_image: { src: string } };
  image?: { url: string; altText?: string; aspect_ratio?: number }; // Fallback image for video
  more_info?: string;
  tiktok_post_name?: string;
  link?: string;
  product__1?: any; // Shopify Product object
  offset_top__1?: number;
  offset_left__1?: number;
  product__2?: any;
  offset_top__2?: number;
  offset_left__2?: number;
  product__3?: any;
  offset_top__3?: number;
  offset_left__3?: number;
  product__4?: any;
  offset_top__4?: number;
  offset_left__4?: number;
  product__5?: any;
  offset_top__5?: number;
  offset_left__5?: number;
}

interface TiktokShopBlock {
  id: string;
  type: 'tiktok_manual_upload';
  settings: TiktokManualUploadBlockSettings;
}

interface TiktokShopProps {
  settings: TiktokShopSettings;
  blocks: TiktokShopBlock[];
  allProducts?: any; // Assuming all_products is passed from loader
}

export function TiktokShop({ settings, blocks, allProducts }: TiktokShopProps) {
  const { 
    section_width, 
    color_scheme, 
    reset_spacing, 
    column_gap, 
    items_per_row_mobile, 
    heading, 
    description, 
    header_size, 
    header_alignment, 
    hotspot_style, 
    image_ratio, 
    custom_ratio, 
    items_per_row, 
    show_arrow, 
    carousel_pagination, 
    infinite, 
    autoplay, 
    autorotate_speed, 
    reveal, 
    scroll_animation, 
    padding_top, 
    padding_bottom 
  } = settings;

  const sectionClasses = clsx(
    'section',
    padding_top < 30 && 'pt-min',
    padding_bottom < 30 && 'pb-min',
    'sec__tiktok',
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
  } as React.CSSProperties;

  const headerSizeClass = clsx({
    'h3': header_size === 'small',
    'h1-size': header_size === 'large',
  });

  const getAspectRatio = (image?: any, video?: any) => {
    if (image_ratio === 'adapt') {
      if (video?.aspect_ratio) return video.aspect_ratio;
      if (image?.aspect_ratio) return image.aspect_ratio;
      return '3/2'; // Default if adapt and no image/video
    }
    switch (image_ratio) {
      case 'square': return '1/1';
      case 'portrait': return '3/4';
      case 'landscape': return '4/3';
      case 'custom': return custom_ratio || '3/2';
      default: return '3/2';
    }
  };

  const [showPopup, setShowPopup] = useState<{ blockId: string; productIndex: number } | null>(null);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className={sectionClasses} style={sectionStyles}>
      <div className={section_width}>
        {(heading || description) && (
          <div className={clsx(
            'section__header mb-33 mb-sm-20',
            `text-${header_alignment}`,
            section_width === 'full_width' && 'px-20'
          )}>
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

        {blocks.length > 0 && (
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
            {blocks.map((block, index) => {
              const blockSettings = block.settings as TiktokManualUploadBlockSettings;
              const motionDelay = index * 50;
              const animationOrder = index + 1;

              const image = blockSettings.image;
              const localVideo = blockSettings.video;
              const imageAlt = image?.altText || 'Tiktok Shop';
              const aspectRatio = getAspectRatio(image, localVideo);

              const products = [];
              for (let i = 1; i <= 5; i++) {
                const productIdKey = `product__${i}` as keyof TiktokManualUploadBlockSettings;
                const product = blockSettings[productIdKey];
                if (product) products.push(product);
              }

              return (
                <SwiperSlide key={block.id}>
                  <div
                    className={clsx(
                      'tiktok-item tiktok-item__media--ratio swiper-slide pointer',
                      scroll_animation !== 'none' && `scroll-trigger ${scroll_animation}`
                    )}
                    style={{ '--animation-order': animationOrder } as React.CSSProperties}
                  >
                    {/* Hotspots */}
                    {products.map((product, productIndex) => {
                      const offsetTopKey = `offset_top__${productIndex + 1}` as keyof TiktokManualUploadBlockSettings;
                      const offsetLeftKey = `offset_left__${productIndex + 1}` as keyof TiktokManualUploadBlockSettings;
                      const positionTop = blockSettings[offsetTopKey] || 0;
                      const positionLeft = blockSettings[offsetLeftKey] || 0;

                      return (
                        <LookbookItem
                          key={productIndex}
                          position_top={positionTop}
                          position_left={positionLeft}
                          hotspot_style={hotspot_style}
                        >
                          {/* Popup content for product */}
                          {/* This will be handled by a state in the parent component */}
                        </LookbookItem>
                      );
                    })}

                    <div
                      className="w-full rounded block"
                      style={{ '--aspect-ratio': aspectRatio } as React.CSSProperties}
                    >
                      {localVideo?.sources?.[0]?.url ? (
                        <video
                          loop
                          muted
                          playsInline
                          autoPlay
                          src={localVideo.sources[0].url}
                          poster={localVideo.preview_image?.src}
                          className="rounded w-full h-full object-cover"
                        ></video>
                      ) : image?.url ? (
                        <Image
                          data={{ url: image.url, altText: imageAlt }}
                          className="rounded w-full h-full object-cover"
                          sizes="auto"
                        />
                      ) : (
                        <span>Placeholder Image/Video</span>
                      )}
                      <svg
                        width="30"
                        height="30"
                        fill="none"
                        className="absolute top-10 z-1 pointer-none right-10"
                      >
                        <use href="#icon-tiktok-shop" /> {/* Assuming a TikTok icon */}
                      </svg>
                    </div>

                    {/* Popup for product details */}
                    {showPopup?.blockId === block.id && (
                      <div className="tiktok-item__media--ratio popup-content popup-index-{{ forloop.index }} absolute inset-0 bg-white shadow-lg flex">
                        <div className="w-full col-sm-w-custom">
                          {localVideo?.sources?.[0]?.url ? (
                            <video
                              loop
                              muted
                              playsInline
                              autoPlay
                              src={localVideo.sources[0].url}
                              poster={localVideo.preview_image?.src}
                              className="rounded w-full h-full object-cover"
                            ></video>
                          ) : image?.url ? (
                            <Image
                              data={{ url: image.url, altText: imageAlt }}
                              className="rounded w-full h-full object-cover"
                              sizes="auto"
                            />
                          ) : (
                            <span>Placeholder Image/Video</span>
                          )}
                          {products.map((product, productIndex) => {
                            const offsetTopKey = `offset_top__${productIndex + 1}` as keyof TiktokManualUploadBlockSettings;
                            const offsetLeftKey = `offset_left__${productIndex + 1}` as keyof TiktokManualUploadBlockSettings;
                            const positionTop = blockSettings[offsetTopKey] || 0;
                            const positionLeft = blockSettings[offsetLeftKey] || 0;
                            return (
                              <LookbookItem
                                key={productIndex}
                                position_top={positionTop}
                                position_left={positionLeft}
                                hotspot_style={hotspot_style}
                              />
                            );
                          })}
                        </div>
                        <div className="w-full col-sm-remaining relative white-gradient">
                          <div className="absolute-sm inset-0 overflow-y-auto custom-scrollbar px-15 px-md-30 py-30">
                            <div className="flex justify-between items-center mb-20 border-bottom">
                              <h4 className="m-0 fs-18">Shop the Look</h4>
                              <button onClick={() => setShowPopup(null)} className="close">
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="14" viewBox="0 0 13 14" fill="none">
                                  <use href="#icon-close" />
                                </svg>
                              </button>
                            </div>
                            <div className="custom-scrollbar">
                              {products.map((product, productIndex) => (
                                <ProductItem key={productIndex} card_product={product} template_enable_rate template_enable_price type="list" sizes="60px" />
                              ))}
                            </div>
                            {blockSettings.more_info && (
                              <div className="more-info mt-25" dangerouslySetInnerHTML={{ __html: blockSettings.more_info }}></div>
                            )}
                            {blockSettings.link && (
                              <Link
                                to={blockSettings.link}
                                aria-label={blockSettings.tiktok_post_name || 'View Post'}
                                className="flex align-center gap-10 no-underline heading-color heading_weight lh-normal mt-20"
                              >
                                <svg width="15" height="15" fill="none">
                                  <path fill="currentColor" d="M14.959 4.41c-.035-.797-.164-1.345-.349-1.82a3.66 3.66 0 0 0-.867-1.33 3.691 3.691 0 0 0-1.328-.864c-.477-.185-1.022-.314-1.82-.35C9.794.01 9.539 0 7.502 0 5.465 0 5.21.009 4.41.044c-.797.035-1.345.164-1.82.349a3.66 3.66 0 0 0-1.33.867c-.38.375-.677.83-.864 1.327-.185.478-.314 1.023-.35 1.82C.01 5.21 0 5.465 0 7.501c0 2.037.009 2.292.044 3.092.035.797.164 1.345.349 1.82a3.7 3.7 0 0 0 .867 1.33c.375.38.83.677 1.327.864.478.185 1.023.314 1.82.349.8.035 1.055.044 3.092.044 2.036 0 2.291-.009 3.091-.044.797-.035 1.345-.164 1.82-.349a3.837 3.837 0 0 0 2.194-2.194c.185-.478.314-1.023.35-1.82.034-.8.043-1.055.043-3.091ZM-1.35 6.124c-.033.733-.156 1.128-.259 1.392a2.489 2.489 0 0 1-1.424 1.424c-.264.103-.662.226-1.392.258-.79.035-1.028.044-3.03.044-2 0-2.241-.009-3.03-.044-.732-.032-1.128-.155-1.391-.258a2.308 2.308 0 0 1-.862-.56 2.331 2.331 0 0 1-.56-.86c-.102-.265-.225-.663-.257-1.393-.036-.79-.044-1.028-.044-3.03 0-2.001.008-2.241.044-3.03.032-.732.155-1.128.257-1.391.12-.326.311-.622.563-.862.243-.249.536-.44.862-.56.263-.102.662-.225 1.391-.257.792-.036 1.029-.044 3.03-.044 2.005 0 2.242.008 3.03.044.733.032 1.128.155 1.392.257.325.12.621.311.862.56.249.243.44.536.56.862.102.263.225.662.257 1.391.035.792.044 1.029.044 3.03 0 2.002-.009 2.236-.044 3.027Z"/><path fill="currentColor" d="M7.506 3.648a3.854 3.854 0 0 0 0 7.707 3.854 3.854 0 0 0 0-7.707ZM7.506 9.999a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5ZM12.405 3.496a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0Z"/>
                                </svg>
                                {blockSettings.tiktok_post_name || 'View Post'}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
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
        )}
      </div>
    </div>
  );
}
