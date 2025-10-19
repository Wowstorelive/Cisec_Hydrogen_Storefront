import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Link } from '@remix-run/react';
import { Image } from '@shopify/hydrogen';

// Define props interface based on Liquid schema settings
interface OutfitIdeaSettings {
  section_width: 'container' | 'fluid_container' | 'stretch_width' | 'full_width';
  color_scheme: string;
  reset_spacing?: boolean;
  column_gap?: number;
  items_per_row?: number;
  heading?: string;
  description?: string;
  image_ratio?: 'adapt' | 'square' | 'portrait' | 'landscape' | 'custom';
  custom_ratio?: string;
  header_size?: 'small' | 'medium' | 'large';
  header_alignment?: 'left' | 'center' | 'right';
  padding_top?: number;
  padding_bottom?: number;
  scroll_animation?: string;
}

interface ImageWithTextOverlayBlockSettings {
  image?: { url: string; altText?: string; aspect_ratio?: number };
  mobile_image?: { url: string; altText?: string; aspect_ratio?: number };
  image_link?: string;
  image_overlay_opacity?: number;
  custom_svg?: string;
  subheading?: string;
  subheading_font_size?: number;
  subheading_font_weight?: string;
  subheading_spacing_bottom?: number;
  heading?: string;
  heading_font_size?: number;
  heading_font_weight?: string;
  heading_uppercase?: boolean;
  heading_spacing_bottom?: number;
  description?: string;
  des_font_size?: number;
  des_font_weight?: string;
  des_spacing_bottom?: number;
  timer?: string; // End time for countdown
  expired_message?: string;
  style?: 'default' | 'highlight'; // Timer style
  font_size?: number; // Timer font size
  spacing_bottom?: number; // Timer spacing bottom
  first_button_label?: string;
  first_button_link?: string;
  first_button_type?: 'primary' | 'outline' | 'link';
  second_button_label?: string;
  second_button_link?: string;
  second_button_type?: 'primary' | 'outline' | 'link';
  content_alignment?: 'left' | 'center' | 'right';
  content_position?: 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  content_padding_block?: number;
  content_padding_inline?: number;
}

interface IdeaBlockSettings {
  image?: { url: string; altText?: string; aspect_ratio?: number };
  product_1?: any; // Shopify Product object
  product_2?: any;
  product_3?: any;
  product_4?: any;
  product_5?: any;
}

interface OutfitIdeaBlock {
  id: string;
  type: 'image_with_text_overlay' | 'idea';
  settings: ImageWithTextOverlayBlockSettings | IdeaBlockSettings;
}

interface OutfitIdeaProps {
  settings: OutfitIdeaSettings;
  blocks: OutfitIdeaBlock[];
  pageType?: string; // To determine if it's homepage
}

// Placeholder for ResponsiveImage component
function ResponsiveImage({ image, image_mobile, image_alt, type, container, colunm }: any) {
  const imageUrl = image?.url;
  const mobileImageUrl = image_mobile?.url || imageUrl;

  return (
    <picture>
      {mobileImageUrl && <source media="(max-width: 767px)" srcSet={mobileImageUrl} />}
      {imageUrl && <img src={imageUrl} alt={image_alt} className="w-full h-full object-cover" />}
    </picture>
  );
}

// Placeholder for CountdownTimer component
function CountdownTimer({ endTime, timeoutMessage, format, daysLabel, hoursLabel, minsLabel, secsLabel, className, style }: any) {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const timerComponents: any[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval]) {
      return;
    }

    timerComponents.push(
      <span key={interval}>
        {timeLeft[interval]} {interval}
      </span>
    );
  });

  return (
    <div className={clsx("timer", className, style)}>
      {timerComponents.length ? timerComponents : <span>{timeoutMessage}</span>}
    </div>
  );
}

// Placeholder for ProductItem component (simplified)
function ProductItem({ card_product, type, custom_widths, sizes }: any) {
  return (
    <div className="product-item">
      {card_product?.image?.url && (
        <img src={card_product.image.url} alt={card_product.title} className="w-16 h-16 object-cover" />
      )}
      <div>
        <h4>{card_product?.title}</h4>
        <p>€{card_product?.price?.amount}</p>
      </div>
    </div>
  );
}

export function OutfitIdea({ settings, blocks, pageType }: OutfitIdeaProps) {
  const { 
    section_width, 
    color_scheme, 
    reset_spacing, 
    column_gap, 
    items_per_row, 
    heading, 
    description, 
    image_ratio, 
    custom_ratio, 
    header_size, 
    header_alignment, 
    padding_top, 
    padding_bottom, 
    scroll_animation 
  } = settings;

  const sectionClasses = clsx(
    'section',
    padding_top < 30 && 'pt-min',
    padding_bottom < 30 && 'pb-min',
    'sec__products-grid',
    'outfit_idea',
    `color-${color_scheme}`,
    reset_spacing && 'remove_spacing'
  );

  const sectionStyles = {
    '--section-pt': `${padding_top}px`,
    '--section-pb': `${padding_bottom}px`,
  } as React.CSSProperties;

  const colStyle = {
    '--col-desktop': items_per_row,
    '--col-tablet': items_per_row > 3 ? 3 : items_per_row,
    '--col-gap': column_gap < 15 ? `${column_gap}px` : '15px',
    '--col-gap-desktop': column_gap >= 15 ? `${column_gap}px` : undefined,
  } as React.CSSProperties;

  const headerSizeClass = clsx({
    'h3': header_size === 'small',
    'h1-size': header_size === 'large',
  });

  const getAspectRatio = () => {
    if (image_ratio === 'adapt') return undefined; // Handled by image component
    switch (image_ratio) {
      case 'square': return '1/1';
      case 'portrait': return '3/4';
      case 'landscape': return '4/3';
      case 'custom': return custom_ratio || '3/2';
      default: return '3/2';
    }
  };

  const aspectRatio = getAspectRatio();

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
          </div>
        )}

        <div
          className={clsx(
            'products-grid__items flex flex-cols flex-wrap',
            blocks.length > 2 && 'products-idea-limit',
            column_gap < 31 && 'row-gap-20 row-gap-md-30'
          )}
          style={colStyle}
        >
          {blocks.map((block, index) => {
            const blockSettings = block.settings as any;
            const motionDelay = index * 50;
            const animationOrder = index + 1;

            switch (block.type) {
              case 'image_with_text_overlay':
                const image = blockSettings.image;
                const mobileImage = blockSettings.mobile_image || image;
                const imageAlt = image?.altText || 'Images';

                const contentPositionClasses = clsx({
                  'justify-start items-start': blockSettings.content_position === 'top-left',
                  'justify-center items-start': blockSettings.content_position === 'top-center',
                  'justify-end items-start': blockSettings.content_position === 'top-right',
                  'justify-start items-center': blockSettings.content_position === 'middle-left',
                  'justify-center items-center': blockSettings.content_position === 'middle-center',
                  'justify-end items-center': blockSettings.content_position === 'middle-right',
                  'justify-start items-end': blockSettings.content_position === 'bottom-left',
                  'justify-center items-end': blockSettings.content_position === 'bottom-center',
                  'justify-end items-end': blockSettings.content_position === 'bottom-right',
                });

                return (
                  <div
                    key={block.id}
                    className={clsx(
                      'section__block-inner gradient hover-effect flex relative',
                      scroll_animation !== 'none' && `scroll-trigger ${scroll_animation}`
                    )}
                    style={{
                      '--aspect-ratio': aspectRatio,
                      '--overlay-opacity': `${blockSettings.image_overlay_opacity}%`,
                      '--animation-order': animationOrder,
                    } as React.CSSProperties}
                  >
                    <div className="banner__media w-full overlay-bg rounded absolute inset-0">
                      {(image || mobileImage) ? (
                        <ResponsiveImage
                          image={image}
                          image_mobile={mobileImage}
                          image_alt={imageAlt}
                        />
                      ) : (
                        <span>Placeholder Image</span>
                      )}
                      {blockSettings.image_link && (
                        <Link
                          className="absolute inset-0 z-2 block hidden-md"
                          aria-label={blockSettings.heading}
                          to={blockSettings.image_link}
                        ></Link>
                      )}
                    </div>
                    <div
                      className={clsx(
                        'sec__content w-full flex',
                        contentPositionClasses,
                        `text-${blockSettings.content_alignment}`
                      )}
                      style={{
                        '--padding-inline': `${blockSettings.content_padding_inline}px`,
                        '--padding-block': `${blockSettings.content_padding_block}px`,
                      } as React.CSSProperties}
                    >
                      <div className={clsx(
                        'sec__content-inner py-custom px-custom relative',
                        blockSettings.content_padding_inline < 35 && 'x-min-value',
                        blockSettings.content_padding_block < 35 && 'y-min-value',
                        blockSettings.content_below_image && 'w-full'
                      )}>
                        {blockSettings.custom_svg && (
                          <div
                            className={clsx(
                              'sec__content-custom-svg',
                              blockSettings.subheading_spacing_bottom > 41 ? 'mb-big' : blockSettings.subheading_spacing_bottom > 30 ? 'mb-medium' : 'mb-custom'
                            )}
                            style={{ '--space-bottom': `${blockSettings.custom_svg_spacing_bottom}px` } as React.CSSProperties}
                            dangerouslySetInnerHTML={{ __html: blockSettings.custom_svg }}
                          ></div>
                        )}
                        {blockSettings.subheading && (
                          <div
                            className={clsx(
                              'sec__content-subheading heading-color heading fs-custom',
                              blockSettings.subheading_font_weight,
                              blockSettings.subheading_spacing_bottom > 41 ? 'mb-big' : blockSettings.subheading_spacing_bottom > 30 ? 'mb-medium' : 'mb-custom'
                            )}
                            style={{ '--font-size': `${blockSettings.subheading_font_size}px`, '--space-bottom': `${blockSettings.subheading_spacing_bottom}px` } as React.CSSProperties}
                          >
                            {blockSettings.subheading}
                          </div>
                        )}
                        {blockSettings.heading && (
                          <h2
                            className={clsx(
                              'sec__content-heading heading-letter-spacing mt-0',
                              blockSettings.heading_spacing_bottom > 41 ? 'mb-big' : blockSettings.heading_spacing_bottom > 30 ? 'mb-medium' : 'mb-custom',
                              blockSettings.heading_uppercase && 'uppercase',
                              blockSettings.heading_font_size > 41 ? 'fs-big' : blockSettings.heading_font_size > 24 ? 'fs-medium' : 'fs-custom',
                              blockSettings.heading_font_weight
                            )}
                            style={{ '--font-size': `${blockSettings.heading_font_size}px`, '--space-bottom': `${blockSettings.heading_spacing_bottom}px` } as React.CSSProperties}
                          >
                            {blockSettings.heading}
                          </h2>
                        )}
                        {blockSettings.description && (
                          <div
                            className={clsx(
                              'sec__content-des rich__text-m0',
                              blockSettings.des_spacing_bottom > 41 ? 'mb-big' : blockSettings.des_spacing_bottom > 30 ? 'mb-medium' : 'mb-custom',
                              blockSettings.des_font_size > 24 ? 'fs-medium' : 'fs-custom',
                              blockSettings.des_font_weight
                            )}
                            style={{ '--font-size': `${blockSettings.des_font_size}px`, '--space-bottom': `${blockSettings.des_spacing_bottom}px` } as React.CSSProperties}
                            dangerouslySetInnerHTML={{ __html: blockSettings.description }}
                          ></div>
                        )}

                        {blockSettings.timer && (
                          <CountdownTimer
                            endTime={blockSettings.timer}
                            timeoutMessage={blockSettings.expired_message}
                            format="dd:hh:mm:ss"
                            daysLabel="days"
                            hoursLabel="hour"
                            minsLabel="mins"
                            secsLabel="secs"
                            className={clsx(
                              'timer outfit-timer',
                              blockSettings.style,
                              blockSettings.spacing_bottom > 41 ? 'mb-big' : blockSettings.spacing_bottom > 30 ? 'mb-medium' : 'mb-custom',
                              blockSettings.font_size > 41 ? 'fs-big' : blockSettings.font_size > 24 ? 'fs-medium' : 'fs-custom'
                            )}
                            style={{ '--font-size': `${blockSettings.font_size}px`, '--space-bottom': `${blockSettings.spacing_bottom}px` } as React.CSSProperties}
                          />
                        )}
                        {(blockSettings.first_button_label || blockSettings.second_button_label) && (
                          <div className={clsx(
                            'sec__content-btn align-center flex flex-wrap gap-15',
                            `justify-content-${blockSettings.content_alignment}`
                          )}>
                            {blockSettings.first_button_label && (
                              <Link
                                {...(blockSettings.first_button_link ? { to: blockSettings.first_button_link } : { role: 'link', 'aria-disabled': true })}
                                aria-label={blockSettings.first_button_label}
                                className={clsx(
                                  'relative z-3 inline-flex justify-center no-underline',
                                  `btn-${blockSettings.first_button_type}`,
                                  'p-lg-content-btn'
                                )}
                              >
                                {blockSettings.first_button_label}
                              </Link>
                            )}
                            {blockSettings.second_button_label && (
                              <Link
                                {...(blockSettings.second_button_link ? { to: blockSettings.second_button_link } : { role: 'link', 'aria-disabled': true })}
                                aria-label={blockSettings.second_button_label}
                                className={clsx(
                                  'relative z-3 inline-flex no-underline',
                                  `btn-${blockSettings.second_button_type}`,
                                  'px-md-20 py-md-10 p-lg-content-btn'
                                )}
                              >
                                {blockSettings.second_button_label}
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                      {blockSettings.image_link && (
                        <Link
                          className="absolute inset-0 z-2 hidden block-md"
                          to={blockSettings.image_link}
                          aria-label={blockSettings.heading}
                        ></Link>
                      )}
                    </div>
                  </div>
                );

              case 'idea':
                const products = [
                  blockSettings.product_1,
                  blockSettings.product_2,
                  blockSettings.product_3,
                  blockSettings.product_4,
                  blockSettings.product_5,
                ].filter(Boolean);

                return (
                  <div
                    key={block.id}
                    className={clsx(
                      'relative block',
                      scroll_animation !== 'none' && `scroll-trigger ${scroll_animation}`
                    )}
                    style={{ '--animation-order': animationOrder } as React.CSSProperties}
                  >
                    <div
                      className="mb-0 mb-md-0 rounded h-full"
                      style={{ '--aspect-ratio': aspectRatio } as React.CSSProperties}
                    >
                      {blockSettings.image?.url ? (
                        <Image
                          data={{ url: blockSettings.image.url, altText: blockSettings.image.altText || 'Outfit Idea' }}
                          className="w-full h-full object-cover"
                          sizes="auto"
                        />
                      ) : (
                        <span>Placeholder Image</span>
                      )}
                    </div>
                    {products.length > 0 && (
                      <IdeaProduct products={products} />
                    )}
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
