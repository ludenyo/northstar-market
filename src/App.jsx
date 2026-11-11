import { BrowserRouter, Link, NavLink, Route, Routes, useParams } from 'react-router-dom'
import { useMemo, useReducer, useState } from 'react'
import { products } from './data/products'

const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || 'https://formspree.io/f/xrgnzzky'

const formatCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const currentItem = state[action.product.id]
      return {
        ...state,
        [action.product.id]: {
          product: action.product,
          quantity: (currentItem?.quantity ?? 0) + 1,
        },
      }
    }
    case 'remove': {
      const nextState = { ...state }
      const currentItem = nextState[action.productId]

      if (!currentItem) {
        return state
      }

      if (currentItem.quantity <= 1) {
        delete nextState[action.productId]
        return nextState
      }

      nextState[action.productId] = {
        ...currentItem,
        quantity: currentItem.quantity - 1,
      }

      return nextState
    }
    case 'clear':
      return {}
    default:
      return state
  }
}

function App() {
  const [cart, dispatchCart] = useReducer(cartReducer, {})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const itemCount = Object.values(cart).reduce(
    (total, item) => total + item.quantity,
    0,
  )

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase()

    return products.filter((product) => {
      const categoryMatch =
        selectedCategory === 'All' || product.category === selectedCategory
      const searchMatch =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery)

      return categoryMatch && searchMatch
    })
  }, [searchTerm, selectedCategory])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>

        <Header itemCount={itemCount} />

        <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  onAddToCart={(product) =>
                    dispatchCart({ type: 'add', product })
                  }
                />
              }
            />
            <Route
              path="/products"
              element={
                <CatalogPage
                  products={filteredProducts}
                  searchTerm={searchTerm}
                  selectedCategory={selectedCategory}
                  onSearchChange={setSearchTerm}
                  onCategoryChange={setSelectedCategory}
                  onAddToCart={(product) =>
                    dispatchCart({ type: 'add', product })
                  }
                />
              }
            />
            <Route
              path="/products/:productId"
              element={
                <ProductDetailPage
                  onAddToCart={(product) =>
                    dispatchCart({ type: 'add', product })
                  }
                />
              }
            />
            <Route
              path="/cart"
              element={
                <CartPage
                  cart={cart}
                  onAddToCart={(product) =>
                    dispatchCart({ type: 'add', product })
                  }
                  onRemove={(productId) =>
                    dispatchCart({ type: 'remove', productId })
                  }
                  onClear={() => dispatchCart({ type: 'clear' })}
                />
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

function Header({ itemCount }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-lg font-black tracking-tight text-slate-900 sm:text-xl"
          aria-label="Northstar Market home"
        >
          Northstar Market
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium ${
                isActive ? 'text-brand-600' : 'text-slate-700 hover:text-brand-600'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `text-sm font-medium ${
                isActive ? 'text-brand-600' : 'text-slate-700 hover:text-brand-600'
              }`
            }
          >
            Shop
          </NavLink>
        </nav>

        <Link
          to="/cart"
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-slate-700"
          aria-label={`Shopping cart with ${itemCount} items`}
        >
          Cart
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-bold text-white">
            {itemCount}
          </span>
        </Link>
      </div>
    </header>
  )
}

function HomePage({ onAddToCart }) {
  const featuredProducts = products.slice(0, 3)

  return (
    <>
      <section className="grid gap-10 rounded-[2rem] bg-slate-900 px-6 py-8 text-white shadow-soft sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:py-12">
        <div className="flex flex-col justify-center">
          <p className="mb-4 inline-flex w-fit rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-100">
            Thoughtful essentials for the everyday workspace
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Upgrade your everyday routines with design-forward finds.
          </h1>
          <p className="mt-5 max-w-xl text-base text-slate-300 sm:text-lg">
            Discover a curated collection of home, desk, and wellness essentials that blend comfort, function, and effortless style.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/products"
              className="rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Shop collection
            </Link>
            <Link
              to="/products"
              className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Browse best sellers
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {featuredProducts.map((product) => (
            <div key={product.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3">
              <img
                src={product.image}
                alt={product.name}
                className="h-52 w-full rounded-xl object-cover"
                loading="lazy"
              />
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-brand-100">{product.badge}</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">{product.name}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => onAddToCart(product)}
                  className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-5 md:grid-cols-3">
        {[
          ['Free shipping', 'On orders over $75'],
          ['Easy returns', '30-day risk-free trial'],
          ['Support', 'Friendly help from our team'],
        ].map(([title, subtitle]) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand-600">
              {title}
            </p>
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          </div>
        ))}
      </section>

      <section className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
            Why customers shop with us
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-slate-900">
            Thoughtful design, fewer decisions, better days.
          </h2>
          <div className="mt-6 space-y-5">
            {[
              'Curated pieces for comfort, productivity, and ease.',
              'Functional details that look beautiful on every surface.',
              'Flexible, realistic shipping with customer-first support.',
            ].map((text) => (
              <div key={text} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-sm text-brand-700">
                  ✓
                </span>
                <p className="text-slate-700">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <NewsletterForm />
      </section>
    </>
  )
}

function CatalogPage({
  products: visibleProducts,
  searchTerm,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onAddToCart,
}) {
  const categoryOptions = ['All', ...new Set(products.map((product) => product.category))]

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
              Shop all
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">
              Everyday essentials for your favorite spaces
            </h1>
          </div>
          <label className="block w-full max-w-md">
            <span className="mb-2 block text-sm font-medium text-slate-700">Search</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {categoryOptions.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCategory === category
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              aria-pressed={selectedCategory === category}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">No products match your search.</p>
          <p className="mt-2 text-slate-600">
            Try a different keyword or switch back to another category.
          </p>
        </div>
      )}
    </section>
  )
}

function ProductCard({ product, onAddToCart }) {
  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <Link to={`/products/${product.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
        <img
          src={product.image}
          alt={product.name}
          width={900}
          height={900}
          loading="lazy"
          className="h-64 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-700">
            {product.badge}
          </span>
          <span className="text-sm font-medium text-slate-500">{product.inventory}</span>
        </div>

        <Link to={`/products/${product.id}`} className="mt-4 block text-xl font-semibold text-slate-900 hover:text-brand-600">
          {product.name}
        </Link>

        <p className="mt-2 text-sm text-slate-600">{product.category}</p>
        <p className="mt-4 text-2xl font-bold text-slate-900">
          {formatCurrency.format(product.price)}
        </p>

        <button
          type="button"
          onClick={() => onAddToCart(product)}
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Add to cart
        </button>
      </div>
    </article>
  )
}

function ProductDetailPage({ onAddToCart }) {
  const { productId } = useParams()
  const product = products.find((item) => item.id === productId)

  if (!product) {
    return <NotFoundPage />
  }

  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-600">
        ← Back to products
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <img
            src={product.image}
            alt={product.name}
            width={900}
            height={900}
            className="h-full w-full rounded-[1.5rem] object-cover"
          />
        </div>

        <div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
            {product.badge}
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold text-slate-900">{product.name}</h1>
          <p className="mt-3 text-lg text-slate-600">{product.description}</p>
          <p className="mt-5 text-3xl font-black text-slate-900">
            {formatCurrency.format(product.price)}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <span
                key={color}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
              >
                {color}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Add to cart
          </button>

          <div className="mt-8 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">What’s included</h2>
            <ul className="mt-3 space-y-2 text-slate-700">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function NewsletterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interest: 'Home office',
    consent: false,
  })
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (status !== 'idle') {
      setStatus('idle')
      setMessage('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!formData.name.trim()) {
      setStatus('error')
      setMessage('Please enter your name before signing up.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }

    if (!formData.consent) {
      setStatus('error')
      setMessage('Please opt in to receive product updates.')
      return
    }

    setStatus('submitting')
    setMessage('Submitting your request...')

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          interest: formData.interest,
          consent: formData.consent,
        }),
      })

      if (!response.ok) {
        throw new Error('Submission failed.')
      }

      setStatus('success')
      setMessage('You are on the list. Expect a welcome note soon.')
      setFormData({
        name: '',
        email: '',
        interest: 'Home office',
        consent: false,
      })
    } catch {
      setStatus('error')
      setMessage(
        'We could not send your signup right now. Please check your Formspree endpoint or try again later.',
      )
    }
  }

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
        Join the list
      </p>
      <h2 className="mt-3 font-display text-3xl font-bold text-slate-900">
        Get surprise drops and styling ideas.
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="Alex Morgan"
            aria-invalid={status === 'error'}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Email address</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="alex@example.com"
            aria-invalid={status === 'error'}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">I’m interested in</span>
          <select
            name="interest"
            value={formData.interest}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            <option value="Home office">Home office</option>
            <option value="Living room">Living room</option>
            <option value="Wellness">Wellness</option>
            <option value="Gift picks">Gift picks</option>
          </select>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <input
            type="checkbox"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          I agree to receive occasional product drops and styling notes.
        </label>

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-300"
        >
          {status === 'submitting' ? 'Submitting...' : 'Sign me up'}
        </button>

        {message && (
          <p
            role="status"
            className={`rounded-xl px-4 py-3 text-sm ${
              status === 'success'
                ? 'bg-emerald-50 text-emerald-700'
                : status === 'error'
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-700'
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  )
}

function CartPage({ cart, onAddToCart, onRemove, onClear }) {
  const cartEntries = Object.values(cart)
  const subtotal = cartEntries.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  )

  if (cartEntries.length === 0) {
    return (
      <section className="rounded-[2rem] bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Cart</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-slate-900">Your cart is empty.</h1>
        <p className="mt-3 text-slate-600">
          Add a few favorites to your cart and they will appear here.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Continue shopping
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Cart</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-slate-900">Your items</h1>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Clear cart
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-4">
          {cartEntries.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
            >
              <img
                src={product.image}
                alt={product.name}
                width={120}
                height={120}
                className="h-28 w-full rounded-xl object-cover sm:w-28"
              />

              <div className="flex-1">
                <Link to={`/products/${product.id}`} className="text-xl font-semibold text-slate-900 hover:text-brand-600">
                  {product.name}
                </Link>
                <p className="mt-1 text-sm text-slate-600">{product.category}</p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {formatCurrency.format(product.price)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onRemove(product.id)}
                  className="h-9 w-9 rounded-full border border-slate-300 text-lg text-slate-700 hover:bg-slate-100"
                  aria-label={`Remove one ${product.name}`}
                >
                  −
                </button>
                <span className="min-w-8 text-center text-sm font-semibold text-slate-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => onAddToCart(product)}
                  className="h-9 w-9 rounded-full border border-slate-300 text-lg text-slate-700 hover:bg-slate-100"
                  aria-label={`Add another ${product.name}`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>

          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency.format(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{subtotal >= 75 ? 'Free' : formatCurrency.format(12)}</span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>
              {formatCurrency.format(subtotal >= 75 ? subtotal : subtotal + 12)}
            </span>
          </div>

          <button
            type="button"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Checkout
          </button>
        </aside>
      </div>
    </section>
  )
}

function NotFoundPage() {
  return (
    <section className="rounded-[2rem] bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">404</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-slate-900">That product is not here.</h1>
      <p className="mt-3 text-slate-600">
        The item you are looking for may have moved or is no longer available.
      </p>
      <Link
        to="/products"
        className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
      >
        Return to shopping
      </Link>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>© 2026 Northstar Market</p>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <Link to="/products" className="hover:text-brand-600">Shop</Link>
        </div>
      </div>
    </footer>
  )
}

export default App
