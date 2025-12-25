import React from "react";

export default function NewUILayout() {
  return (
    <div className="min-h-screen bg-[rgb(248,250,252)]">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <Hero />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-6">
            <SearchBar />
            <Categories />
            <FeaturedCarousel />
            <ListingGrid />
          </section>

          <aside className="space-y-6">
            <QuickStats />
            <MapCard />
            <NewsletterCard />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ----------------------- HEADER ----------------------- */
function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center 
            bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold shadow">
            R
          </div>
          <div>
            <div className="text-lg font-semibold">Room & Food Finder</div>
            <div className="text-xs text-slate-500">Find stays & meals nearby</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-4">
          <a className="text-sm text-slate-700 hover:text-black" href="#">Home</a>
          <a className="text-sm text-slate-600 hover:text-black" href="#">Explore</a>
          <a className="text-sm text-slate-600 hover:text-black" href="#">For Providers</a>
          <a className="text-sm text-slate-600 hover:text-black" href="#">Support</a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="px-3 py-1 rounded-md border text-sm">Sign in</button>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow font-semibold">
            List your place
          </button>
        </div>
      </div>
    </header>
  );
}

/* ----------------------- HERO ----------------------- */
function Hero() {
  return (
    <section className="relative rounded-2xl p-8 bg-gradient-to-br from-white to-[#f6f9ff] overflow-hidden">

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        
        {/* Left */}
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">
            Comfortable stays & tasty meals — nearby
          </h1>
          <p className="text-slate-600 mt-3">
            Fast search, map view and provider dashboard — perfect for students and professionals.
          </p>

          <div className="mt-6 flex gap-3 items-center">
            <SearchBarInline />
            <button className="px-4 py-3 rounded-lg border">Explore</button>
          </div>

          <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
            <span className="px-3 py-1 rounded-full bg-white border text-sm text-slate-600">Veg</span>
            <span className="px-3 py-1 rounded-full bg-white border text-sm text-slate-600">Non-veg</span>
            <span className="px-3 py-1 rounded-full bg-white border text-sm text-slate-600">With Mess</span>
          </div>
        </div>

        {/* Right */}
        <div className="relative">
          <div className="bg-white/70 border border-white/60 rounded-2xl p-5 shadow-md 
            backdrop-blur-md transform transition hover:-translate-y-1">
            <div className="flex items-center justify-between">

              <div>
                <div className="text-xs text-slate-400">Top pick</div>
                <div className="text-lg font-semibold mt-1">Cozy apartment</div>
                <div className="text-sm text-slate-500 mt-2">Near campus — quick commute</div>

                <div className="mt-4 flex items-center gap-3">
                  <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 
                    text-white font-semibold shadow">
                    Book now
                  </button>
                  <button className="px-3 py-1 rounded-md border">Details</button>
                </div>
              </div>

              <div className="w-40 h-28 rounded-xl overflow-hidden shadow">
                <img 
                  src="https://source.unsplash.com/collection/190727/400x300?room" 
                  className="w-full h-full object-cover" 
                />
              </div>

            </div>
          </div>
        </div>

      </div>

    </section>
  );
}

function SearchBarInline() {
  return (
    <div className="flex items-center gap-2 w-full">
      <input
        className="px-4 py-3 rounded-xl border flex-1 outline-none focus:ring-2 focus:ring-blue-300"
        placeholder="City, locality or college"
      />
      <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow font-semibold">
        Search
      </button>
    </div>
  );
}

/* ----------------------- SEARCH BAR ----------------------- */
function SearchBar() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-md flex items-center gap-3">
      <input
        className="px-4 py-3 rounded-xl border flex-1"
        placeholder="Search by city, college or locality"
      />
      <div className="flex items-center gap-2">
        <button className="px-3 py-2 border rounded-md hidden sm:inline">Filters</button>
        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow font-semibold">
          Search
        </button>
      </div>
    </div>
  );
}

/* ----------------------- CATEGORIES ----------------------- */
function Categories() {
  const cats = ["All", "PG & Hostels", "Apartments", "Mess", "Budget", "Premium"];

  return (
    <div className="flex items-center gap-3 overflow-x-auto py-2">
      {cats.map((c, i) => (
        <button
          key={i}
          className={`px-4 py-2 rounded-xl whitespace-nowrap ${
            i === 0 ? "bg-slate-900 text-white" : "bg-white border text-slate-700"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

/* ----------------------- FEATURED CARDS ----------------------- */
function FeaturedCarousel() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">

      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Featured this week</h4>
        <div className="text-sm text-slate-400">See all</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg overflow-hidden bg-slate-50 transition hover:shadow-lg"
          >
            <img
              src={`https://source.unsplash.com/collection/190727/600x400?sig=${i}`}
              className="w-full h-40 object-cover"
            />
            <div className="p-3">
              <div className="font-semibold">Cozy place {i}</div>
              <div className="text-sm text-slate-500 mt-1">From ₹6500</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

/* ----------------------- LISTINGS GRID ----------------------- */
function ListingGrid() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Popular near you</h3>
        <div className="text-sm text-slate-400">Showing 1–9</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <article
            key={i}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition cursor-pointer"
          >
            <div className="relative">
              <img
                src={`https://source.unsplash.com/collection/190727/800x600?sig=list${i}`}
                className="w-full h-44 object-cover"
              />
              <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-md text-sm font-semibold shadow">
                ₹{2500 + i * 300}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg truncate">Listing #{i + 1}</h3>
              <div className="text-sm text-slate-500 mt-1 truncate">Near city center</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ----------------------- SIDEBAR CARDS ----------------------- */
function QuickStats() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-400">Total listings</div>
          <div className="text-2xl font-semibold">128</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-slate-50 p-3 rounded-lg text-center">
          <div className="text-sm text-slate-500">Available</div>
          <div className="font-semibold">54</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg text-center">
          <div className="text-sm text-slate-500">Booked</div>
          <div className="font-semibold">74</div>
        </div>
      </div>
    </div>
  );
}

function MapCard() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg">
      <h4 className="font-semibold mb-3">Map</h4>
      <div className="h-48 bg-slate-50 rounded-md flex items-center justify-center text-slate-400">
        Map placeholder
      </div>
    </div>
  );
}

function NewsletterCard() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg">
      <h4 className="font-semibold">Subscribe</h4>
      <p className="text-sm text-slate-500 mt-1">Get the best deals and updates.</p>
      <div className="mt-3 flex gap-2">
        <input
          className="px-3 py-2 border rounded-lg w-full outline-none"
          placeholder="Your email"
        />
        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow font-semibold">
          Join
        </button>
      </div>
    </div>
  );
}

/* ----------------------- FOOTER ----------------------- */
function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div>
          <div className="font-semibold">Room & Food Finder</div>
          <div className="text-sm text-slate-400">
            © {new Date().getFullYear()} All rights reserved
          </div>
        </div>
        <div className="text-sm text-slate-500">Made for portfolio ✨</div>
      </div>
    </footer>
  );
}
