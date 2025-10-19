import {
  type ActionFunctionArgs,
  defer,
  json,
  type LoaderFunctionArgs,
  redirect,
} from '@shopify/remix-oxygen';
import {type MetaArgs, useLoaderData} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import {ADD_SUBSCRIBER_MUTATION} from '~/data/commonFragments';
import {getLoaderRouteFromMetaobject} from '~/utils/getLoaderRouteFromMetaobject';
import {RouteContent} from '~/sections/RouteContent';
import {CollectionList} from '~/components/CollectionList'; // Import CollectionList
import {OutfitIdea} from '~/components/OutfitIdea'; // Import OutfitIdea
import {InstagramShop} from '~/components/InstagramShop'; // Import InstagramShop
import clsx from 'clsx';

export const headers = routeHeaders;

export async function loader(args: LoaderFunctionArgs) {
  const {params, context} = args;
  const {language, country} = context.storefront.i18n;
  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the locale URL param is defined, yet we still are on `EN-US`
    // the the locale param must be invalid, send to the 404 page
    throw new Response(null, {status: 404});
  }

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  if (!criticalData.route) {
    return redirect(params?.locale ? `${params.locale}/products` : '/products');
  }

  // Fetch collections for CollectionList
  const collections = await context.storefront.query(COLLECTIONS_QUERY, {
    variables: {
      count: 4, // Fetch 4 collections for the example
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  // Fetch collections for CollectionList
  const collections = await context.storefront.query(COLLECTIONS_QUERY, {
    variables: {
      count: 4, // Fetch 4 collections for the example
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  // Fetch products for OutfitIdea blocks
  const outfitIdeaProducts = await context.storefront.query(OUTFIT_IDEA_PRODUCTS_QUERY, {
    variables: {
      first: 5, // Fetch 5 products for the example idea block
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  // Fetch products for InstagramShop blocks
  const instagramShopProducts = await context.storefront.query(INSTAGRAM_SHOP_PRODUCTS_QUERY, {
    variables: {
      first: 5, // Fetch 5 products for the example instagram shop block
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  return defer({
    ...deferredData,
    ...criticalData,
    collections: collections.collections.nodes,
    outfitIdeaProducts: outfitIdeaProducts.products.nodes,
    instagramShopProducts: instagramShopProducts.products.nodes,
  });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({
  context,
  params,
  request,
}: LoaderFunctionArgs) {
  const {language, country} = context.storefront.i18n;

  const [{shop}, {route}] = await Promise.all([
    context.storefront.query(HOMEPAGE_SEO_QUERY, {
      variables: {country, language},
    }),
    getLoaderRouteFromMetaobject({
      params,
      context,
      request,
      handle: 'route-home',
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    shop,
    route,
    seo: seoPayload.home({url: request.url}),
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData(args: LoaderFunctionArgs) {
  return {};
}

export async function action({request, context}: ActionFunctionArgs) {
  const {storefront} = context;

  // Action handle Wishlist form submission
  const formData = await request.formData();
  const {_action, product_handle, is_liked, new_subscribe_email, ...value} =
    Object.fromEntries(formData);

  //  add new subscriber
  if (_action === 'add_new_subscribe' && new_subscribe_email) {
    const customerCreateData = await storefront.mutate(
      ADD_SUBSCRIBER_MUTATION,
      {
        variables: {
          email: new_subscribe_email.toString(),
          // create a new customer with a random password
          password: Math.random().toString(36).substring(7),
        },
      },
    );
    return json(customerCreateData);
  }

  return json({
    message: '_Index route - Hello, World!',
  });
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match?.data as any)?.seo));
};

export default function Homepage() {
  const {route, collections, outfitIdeaProducts, instagramShopProducts} = useLoaderData<typeof loader>();

  // Example blocks for OutfitIdea
  const outfitIdeaBlocks = [
    {
      id: 'block1',
      type: 'image_with_text_overlay',
      settings: {
        image: { url: 'https://cdn.shopify.com/s/files/1/0533/2088/1000/files/placeholder_image.jpg', altText: 'Outfit Idea 1' },
        heading: 'Summer Sale!',
        description: '<p>Up to 50% off on all summer collection.</p>',
        timer: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
        first_button_label: 'Shop Now',
        first_button_link: '/collections/summer-collection',
        content_alignment: 'center',
        content_position: 'middle-center',
        image_overlay_opacity: 30,
        font_size: 36,
        spacing_bottom: 30,
        style: 'highlight',
      },
    },
    {
      id: 'block2',
      type: 'idea',
      settings: {
        image: { url: 'https://cdn.shopify.com/s/files/1/0533/2088/1000/files/placeholder_outfit.jpg', altText: 'Outfit Idea 2' },
        product_1: outfitIdeaProducts[0],
        product_2: outfitIdeaProducts[1],
        product_3: outfitIdeaProducts[2],
      },
    },
  ];

  // Example blocks for InstagramShop
  const instagramShopBlocks = [
    {
      id: 'instaBlock1',
      type: 'instagram_manual_upload',
      settings: {
        image: { url: 'https://cdn.shopify.com/s/files/1/0533/2088/1000/files/placeholder_instagram1.jpg', altText: 'Instagram Post 1' },
        product__1: instagramShopProducts[0],
        offset_top__1: 10,
        offset_left__1: 20,
        product__2: instagramShopProducts[1],
        offset_top__2: 50,
        offset_left__2: 70,
        instagram_post_name: '@wowstore_fashion',
        link: 'https://www.instagram.com/wowstore_fashion/',
      },
    },
    {
      id: 'instaBlock2',
      type: 'instagram_manual_upload',
      settings: {
        image: { url: 'https://cdn.shopify.com/s/files/1/0533/2088/1000/files/placeholder_instagram2.jpg', altText: 'Instagram Post 2' },
        product__1: instagramShopProducts[2],
        offset_top__1: 30,
        offset_left__1: 40,
        instagram_post_name: '@wowstore_style',
        link: 'https://www.instagram.com/wowstore_style/',
      },
    },
  ];

  return (
    <div className={clsx('page-home', 'pb-20 lg:pb-28 xl:pb-32')}>
      {/* 3. Render the route's content sections */}
      <RouteContent route={route} />

      {/* Collection List Section */}
      {collections && collections.length > 0 && (
        <CollectionList
          settings={{
            section_width: 'container',
            color_scheme: 'default-color-scheme',
            heading: 'Shop by Category',
            description: 'Explore our curated collections',
            show_view_all_button: true,
            display_mode: 'carousel', // Or 'grid'
            items_per_row: 4,
            items_per_row_mobile: 1.5,
            column_gap: 20,
            show_arrow: true,
            carousel_pagination: 'show_dots',
            infinite: true,
            autoplay: true,
            autorotate_speed: 5,
            padding_top: 50,
            padding_bottom: 50,
          }}
          blocks={collections.map((collection: any) => ({
            id: collection.id,
            type: 'collection',
            settings: {
              collection: {
                id: collection.id,
                handle: collection.handle,
                title: collection.title,
                description: collection.description,
                imageUrl: collection.image?.url,
                url: `/collections/${collection.handle}`,
                productsCount: collection.productsCount?.nodes?.length || 0,
              },
            },
          }))}
          pageType="index" // Assuming this is the homepage
        />
      )}

      {/* Outfit Idea Section */}
      {outfitIdeaProducts && outfitIdeaProducts.length > 0 && (
        <OutfitIdea
          settings={{
            section_width: 'container',
            color_scheme: 'default-color-scheme',
            heading: 'Outfit Idea & Sale of the Day',
            description: 'Discover curated outfits and limited-time offers.',
            items_per_row: 2,
            column_gap: 30,
            padding_top: 50,
            padding_bottom: 50,
            header_alignment: 'center',
            header_size: 'large',
          }}
          blocks={outfitIdeaBlocks}
          pageType="index"
        />
      )}

      {/* Instagram Shop Section */}
      {instagramShopProducts && instagramShopProducts.length > 0 && (
        <InstagramShop
          settings={{
            section_width: 'container',
            color_scheme: 'default-color-scheme',
            heading: 'Shop by Gram',
            description: 'Discover our latest looks on Instagram and shop directly!',
            items_per_row: 4,
            items_per_row_mobile: 2,
            column_gap: 20,
            show_arrow: true,
            carousel_pagination: 'show_dots',
            infinite: true,
            autoplay: true,
            autorotate_speed: 5,
            padding_top: 50,
            padding_bottom: 50,
            header_alignment: 'center',
            header_size: 'medium',
            hotspot_style: 'plus',
          }}
          blocks={instagramShopBlocks}
          allProducts={instagramShopProducts} // Pass all products for lookup in popup
        />
      )}
    </div>
  );
}

export const HOMEPAGE_SEO_QUERY = `#graphql
  query seoCollectionContent($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    shop {
      name
      description
    }
  }
` as const;

const COLLECTIONS_QUERY = `#graphql
  query Collections(
    $count: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collections(first: $count) {
      nodes {
        id
        title
        handle
        description
        image {
          url
          altText
          width
          height
        }
        productsCount: products(first: 1) {
          # This is a hack to get product count, as productsCount is not directly available
          # You might need a more robust solution for accurate count
          nodes {
            id
          }
        }
      }
    }
  }
` as const;

const OUTFIT_IDEA_PRODUCTS_QUERY = `#graphql
  query OutfitIdeaProducts(
    $first: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first) {
      nodes {
        id
        title
        handle
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 1) {
          nodes {
            url
            altText
          }
        }
      }
    }
  }
` as const;

const INSTAGRAM_SHOP_PRODUCTS_QUERY = `#graphql
  query InstagramShopProducts(
    $first: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first) {
      nodes {
        id
        title
        handle
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 1) {
          nodes {
            url
            altText
          }
        }
      }
    }
  }
` as const;
