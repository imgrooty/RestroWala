import { ImageResponse } from 'next/og'
import { getRestaurantBySlug } from '@/lib/restaurant-fetcher'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    // Basic slug validation
    const isValidSlug = slug && /^[a-z0-9-]+$/.test(slug)

    if (!slug || !isValidSlug) {
      // Default OG Image for the platform
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              backgroundImage: 'radial-gradient(circle at 25px 25px, #f1f5f9 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f1f5f9 2%, transparent 0%)',
              backgroundSize: '100px 100px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                borderRadius: '24px',
                backgroundColor: '#4f46e5',
                marginBottom: '40px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              }}
            >
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                <line x1="6" y1="17" x2="18" y2="17" />
              </svg>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <h1
                style={{
                  fontSize: '80px',
                  fontWeight: '900',
                  color: '#0f172a',
                  margin: '0',
                  letterSpacing: '-0.05em',
                }}
              >
                Restro<span style={{ color: '#4f46e5' }}>Wala</span>
              </h1>
              <p
                style={{
                  fontSize: '32px',
                  color: '#64748b',
                  margin: '20px 0 0 0',
                  fontWeight: '500',
                  textAlign: 'center',
                  maxWidth: '800px',
                }}
              >
                The OS for your Modern Restaurant.
              </p>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      )
    }

    // Restaurant-specific OG Image
    // Fetch restaurant data from database
    const restaurant = await getRestaurantBySlug(slug)

    if (!restaurant) {
       return new Response('Restaurant not found', { status: 404 })
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            padding: '80px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {restaurant.logo && (restaurant.logo.startsWith('http://') || restaurant.logo.startsWith('https://')) ? (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '40px',
                  marginBottom: '40px',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '40px',
                  backgroundColor: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '40px',
                  fontSize: '80px',
                  color: '#ffffff',
                  fontWeight: '900',
                }}
              >
                {restaurant.name.charAt(0)}
              </div>
            )}
            <h1
              style={{
                fontSize: '72px',
                fontWeight: '900',
                color: '#0f172a',
                margin: '0',
                letterSpacing: '-0.02em',
              }}
            >
              {restaurant.name}
            </h1>
            <p
              style={{
                fontSize: '30px',
                color: '#64748b',
                marginTop: '24px',
                fontWeight: '500',
                maxWidth: '900px',
                lineHeight: '1.4',
              }}
            >
              {restaurant.description || `Welcome to ${restaurant.name}. Experience our digital menu and place your orders in real-time.`}
            </p>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#4f46e5',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '2px' }} />
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>
              Restro<span style={{ color: '#4f46e5' }}>Wala</span>
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    console.log(`${message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
