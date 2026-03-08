import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "../assets/css/producto-list.css";
import Encabezado from "../components/Encabezado";
import PiePagina from "../components/PiePagina";
import { useCart } from "../context/CartContext";
import logo from "../assets/images/image.png";
// TopActionButtons se renderiza globalmente en App.jsx — evitar duplicados




const SECTION_OPTIONS = [
	{ value: "todas", label: "Todas las secciones" },
	{ value: "dermocosmetica", label: "Dermocosmetica" },
	{ value: "bijouterie", label: "Bijouterie" },
	{ value: "perfumeria", label: "Perfumeria" }
];

const BRANCH_OPTIONS = [
	{ value: "todas", label: "Todas las sucursales" },
	{ value: "hc farma gandhi", label: "HC Farma Gandhi" },
	{ value: "hc farma ruta 20", label: "HC Farma Ruta 20" },
	{ value: "hc farma san martin", label: "HC Farma San Martin" }
];

const BRANCH_LABELS = {
	"hc farma gandhi": "HC Farma Gandhi",
	"hc farma ruta 20": "HC Farma Ruta 20",
	"hc farma san martin": "HC Farma San Martin"
};

// Número total de sucursales conocidas (usar para determinar "todas las sucursales")
const TOTAL_BRANCHES = 3;

const SUBCATEGORY_OPTIONS = [
	{ value: "todas", label: "Todas" },
	{ value: "masculino", label: "Masculino" },
	{ value: "femenino", label: "Femenino" }
];
export default function ProductoList() {
	const location = useLocation();
	const { addToCart } = useCart();
	// allProducts: array con TODOS los productos (fetch completo en cliente)
	const [allProducts, setAllProducts] = useState([]);
	const [totalServerItems, setTotalServerItems] = useState(null);

	// Normaliza string: quita diacríticos y deja minúsculas
	const normalizeString = (s) =>
		String(s || "")
			.toLowerCase()
			.normalize("NFD")
			.replace(/\p{Diacritic}/gu, "")
			.replace(/[^a-z0-9]+/g, " ")
			.trim();

	// Obtener imagen principal desde objeto producto (Store API) o usar logo por defecto
	const getImage = (product) => {
		if (!product) return logo;
		if (product._image) return product._image;
		if (product.images && product.images[0]) return product.images[0].src || product.images[0].url;
		if (product.featured_media_url) return product.featured_media_url;
		// antiguo payload WP REST
		if (product._embedded && product._embedded['wp:attachment'] && product._embedded['wp:attachment'][0]) return product._embedded['wp:attachment'][0].source_url;
		return logo;
	};
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [query, setQuery] = useState("");
	const [activeQuery, setActiveQuery] = useState("");
	const [showAutocomplete, setShowAutocomplete] = useState(false);
	const inputRef = useRef(null);
	const [notifications, setNotifications] = useState([]);
	const [showLimitModal, setShowLimitModal] = useState(false);
	const [sectionFilter, setSectionFilter] = useState("todas");
	const [branchFilter, setBranchFilter] = useState("todas");
	const [subFilter, setSubFilter] = useState("todas");
	const [categoriesMap, setCategoriesMap] = useState({});
	const [branchOptions] = useState(BRANCH_OPTIONS);
	const ITEMS_PER_PAGE = 10;
	// NOTE: traemos todos los productos al cargar y paginamos en cliente
	const [page, setPage] = useState(1);

	const selectedBranch = branchOptions.find((b) => b.value === branchFilter);
	const showBranchNotice = branchFilter !== "todas" && branchFilter !== "hc farma gandhi";

	useEffect(() => {
		// Sincronizar filtros desde query params (para que los links del MobileMenu funcionen inmediatamente)
		const syncFiltersFromQuery = () => {
			try {
				const params = new URLSearchParams(location.search || "");
				const s = params.get("section");
				const b = params.get("branch");
				const sub = params.get("sub");
				if (s && s !== sectionFilter) setSectionFilter(s);
				if (b && b !== branchFilter) setBranchFilter(b);
				if (sub && sub !== subFilter) setSubFilter(sub);
			} catch (e) {
				// ignore
			}
		};

		syncFiltersFromQuery();
	}, [location.search]);

	// Reiniciar la página cuando cambian la búsqueda o los filtros
	useEffect(() => {
		setPage(1);
	}, [activeQuery, sectionFilter, branchFilter, subFilter]);
		useEffect(() => {
			const fetchAllProducts = async () => {
				try {
					const STOREFRONT_BASE = import.meta.env.DEV
						? '/wp-json/wc/store/products'
						: 'https://api.hcfarma.com.ar/wp-json/wc/store/products';

					const res = await fetch(`${STOREFRONT_BASE}?per_page=100`);

					if (!res.ok) throw new Error("Error al cargar productos");

					const data = await res.json();

					const mapBranches = (description) => {
						if (!description) return [];

						const text = String(description).replace(/<[^>]+>/g, " ").toLowerCase();

						const branches = new Set();

						if (text.includes("gandhi")) branches.add("hc farma gandhi");
						if (text.includes("ruta 20")) branches.add("hc farma ruta 20");
						if (text.includes("san martin")) branches.add("hc farma san martin");

						return Array.from(branches);
					};

					const formattedProducts = (data || []).map((p) => {
						// detectar URL de imagen en varias rutas posibles
						const imageCandidates = [];
						if (p.images && p.images[0]) imageCandidates.push(p.images[0].src || p.images[0].url);
						if (p.featured_media_url) imageCandidates.push(p.featured_media_url);
						if (p.images && p.images.length) p.images.forEach(i => { if (i.src) imageCandidates.push(i.src); if (i.url) imageCandidates.push(i.url); });
						if (p._embedded && p._embedded['wp:attachment'] && p._embedded['wp:attachment'][0]) imageCandidates.push(p._embedded['wp:attachment'][0].source_url);
						// intentar extraer <img src="..."> desde la descripción HTML
						try {
							const desc = p.description || p.short_description || '';
							const m = String(desc).match(/<img[^>]+src=["']([^"']+)["']/i);
							if (m && m[1]) imageCandidates.push(m[1]);
						} catch (e) {
							// ignore
						}

						const imageUrl = imageCandidates.find(Boolean) || null;

						const priceText = (() => {
							// 1) precio en campos estructurados
							if (p.price && String(p.price).trim() !== '' && String(p.price).trim() !== '0') return `$ ${p.price}`;
							if (p.regular_price && String(p.regular_price).trim() !== '' && String(p.regular_price).trim() !== '0') return `$ ${p.regular_price}`;
							if (p.prices && p.prices.price !== undefined && p.prices.price !== null && String(p.prices.price).trim() !== '0') {
								const v = p.prices.price;
								return typeof v === 'number' ? `$ ${v / 100}` : `$ ${v}`;
							}
							if (p.price_html) {
								const txt = p.price_html.replace(/<[^>]+>/g, '').trim();
								if (txt && txt !== '$0') return txt;
							}

							// 2) intentar extraer desde la descripción (ej: "<strong>Precio:</strong>$35.438,4")
							try {
								const desc = p.description || p.short_description || '';
								const div = document.createElement('div');
								div.innerHTML = desc;
								const text = (div.textContent || div.innerText || '').replace(/\u00A0/g, ' ');
								const m = text.match(/precio\s*[:\-]?\s*\$?\s*([0-9][0-9.,]+)/i);
								if (m && m[1]) return `$ ${m[1].trim()}`;
							} catch (e) {
								// ignore
							}

							return null;
						})();

						return {
							id: p.id,
							title: { rendered: p.name },
							content: { rendered: p.description || p.short_description || '' },
							_priceText: priceText,
							images: p.images || [],
							_image: imageUrl,
							_branches: mapBranches(p.description || p.short_description || '')
						};
					});

					// Diagnostic logs
					console.log('STORE API sample raw:', data && data[0]);
					console.log('Mapped sample product:', formattedProducts && formattedProducts[0]);

					setAllProducts(formattedProducts);
					setTotalServerItems(formattedProducts.length);
					setLoading(false);

					console.log("Productos cargados:", formattedProducts.length);
				} catch (err) {
					setError(err.message || String(err));
					setLoading(false);
				}
			};

			fetchAllProducts();
		}, []);


	// Decodifica HTML entities y devuelve texto plano en minúsculas
	const decodeToText = (html) => {
		if (!html) return "";
		try {
			const div = document.createElement("div");
			div.innerHTML = html;
			return (div.textContent || div.innerText || "").replace(/\u00A0/g, " ").toLowerCase();
		} catch (e) {
			return String(html).replace(/<[^>]+>/g, "").toLowerCase();
		}
	};

	const decodeToPlainText = (html) => {
		if (!html) return "";
		try {
			const div = document.createElement("div");
			div.innerHTML = html;
			return (div.textContent || div.innerText || "").replace(/\u00A0/g, " ");
		} catch (e) {
			return String(html).replace(/<[^>]+>/g, "");
		}
	};

	// Función común para verificar si un producto coincide con la consulta
	const productMatchesQuery = (product, query) => {
		if (!query) return true;

		const q = normalizeString(query);
		if (!q) return true;
		const qTokens = q.split(/\s+/).filter(Boolean);

		const title = decodeToPlainText(product.title?.rendered || "");
		const titleNorm = normalizeString(title);
		const titleTokens = titleNorm.split(/\s+/).filter(Boolean);

		// 1) Si la frase completa aparece en el título, OK
		if (titleNorm.includes(q)) return true;

		// 2) Si todos los tokens aparecen como palabras completas en el título (AND), OK
		const allTokensPresent = qTokens.every((t) => titleTokens.includes(t));
		if (allTokensPresent) return true;

		// 3) Buscar por códigos numéricos (EAN/CÓDIGO) si la query contiene dígitos
		const qDigits = q.replace(/\D/g, "");
		if (qDigits.length > 0) {
			const code = (getCode(product.content?.rendered) || "").replace(/\D/g, "");
			if (code && code.includes(qDigits)) return true;
			const numericCodes = getAllNumericCodes(product.content?.rendered);
			if (numericCodes.some((c) => c.includes(qDigits))) return true;
		}

		return false;
	};

	const getPrice = (html) => {
		if (!html) return "Precio no disponible";
		const div = document.createElement("div");
		div.innerHTML = html;
		const text = (div.textContent || div.innerText || "").replace(/\u00A0/g, " ");
		const match = text.match(/precio\s*[:\-]?\s*\$?\s*([0-9][0-9.,]+)/i);
		return match?.[1] ? `$ ${match[1].trim()}` : "Precio no disponible";
	};

	const getCode = (html) => {
		if (!html) return "";
		const div = document.createElement("div");
		div.innerHTML = html;
		const text = (div.textContent || div.innerText || "").replace(/\u00A0/g, " ");
		// Buscar patrones como "Código:", "EAN:", "Cod:" seguidos de números
		const match = text.match(/(?:c[oó]digo|ean|cod|code)\s*[:\-]?\s*([0-9]+)/i);
		return match?.[1]?.trim() || "";
	};

	// Extrae secuencias numéricas y las normaliza (quita espacios/guiones)
	const getAllNumericCodes = (html) => {
		if (!html) return [];
		try {
			const div = document.createElement("div");
			div.innerHTML = html;
			const text = (div.textContent || div.innerText || "").replace(/\u00A0/g, " ");
			// Buscar secuencias con dígitos, espacios o guiones de longitud >= 6
			const rawSeqs = text.match(/[0-9\-\s]{6,}/g) || [];
			const normalized = rawSeqs
				.map((s) => s.replace(/\D/g, ""))
				.filter((s) => s.length >= 6);
			return Array.from(new Set(normalized));
		} catch (e) {
			return [];
		}
	};


	// Base único de productos (todos los productos descargados)
	const fetchedProductsFlat = allProducts;

	const filteredProducts = fetchedProductsFlat.filter((p) => {
		const normalizedQuery = (activeQuery || query).trim().toLowerCase();
		const normalizedQueryDigits = normalizedQuery.replace(/\D/g, "");
		const titleMatch = productMatchesQuery(p, activeQuery || query);
		const code = getCode(p.content?.rendered).toLowerCase();
		const numericCodes = getAllNumericCodes(p.content?.rendered);
		let codeMatch = false;
		if (normalizedQueryDigits.length >= 6) {
			// Si el usuario ingresó principalmente dígitos, comparar con códigos numéricos normalizados
			codeMatch = numericCodes.some((c) => c.includes(normalizedQueryDigits));
		} else {
			codeMatch = code.includes(normalizedQuery);
		}

		// Obtener categorías normalizadas (name y slug)
		const categoryNames = (p.product_cat || [])
			.map((id) => categoriesMap[id])
			.filter(Boolean)
			.flatMap((c) => [c.normName, c.normSlug]);

		const normalizeValue = (s) =>
			String(s || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, " ").trim();

		const matchesSection =
			sectionFilter === "todas" || categoryNames.includes(normalizeValue(sectionFilter));

		// Lógica de subcategoría (solo aplicable para Perfumeria)
		let matchesSub = true;
		if (sectionFilter === "perfumeria" && subFilter !== "todas") {
			const contentText = normalizeValue(decodeToText(p.content?.rendered));
			const sub = normalizeValue(subFilter);
			const SUB_SYNONYMS = {
				masculino: ["masculino", "hombre"],
				femenino: ["femenino", "mujer"]
			};
			const synonyms = SUB_SYNONYMS[sub] || [sub];
			matchesSub = synonyms.some((s) => categoryNames.includes(s) || contentText.includes(s));
		}

		const productBranches = p._branches || [];

		// Comportamiento solicitado:
		// - Si el producto tiene EXACTAMENTE 1 sucursal, debe mostrarse solo cuando
		//   esa sucursal esté seleccionada (no en 'todas').
		// - Si el producto no tiene información de sucursales (length === 0),
		//   lo tratamos como disponible en todas las sucursales.
		// - Si el producto tiene 2+ sucursales, se muestra en 'todas' y según filtro.

		let matchesBranch;
		if (branchFilter === "todas") {
			matchesBranch = true;
		} else {
			// Para una sucursal seleccionada: mostrar si el producto lista esa sucursal
			// o si no tiene info de sucursales (asumir disponible en todas).
			matchesBranch = productBranches.length === 0 || productBranches.includes(branchFilter);
		}

		// No ignorar el filtro de sucursal durante la búsqueda: siempre aplicarlo
		const isSearching = normalizedQuery.length > 0;
		const finalMatchesSection = isSearching ? true : (matchesSection && matchesSub);
		const finalMatchesBranch = matchesBranch;

		return (titleMatch || codeMatch) && finalMatchesSection && finalMatchesBranch;
	});

	// Paginación basada en los productos filtrados (cliente)
	const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

	// Paginación 100% en cliente: tomar slice de filteredProducts
	const startIndex = (page - 1) * ITEMS_PER_PAGE;
	const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

	// pageLoading: considerar loading general o ausencia de productos descargados
	const pageLoading = loading && allProducts.length === 0;

	// Ya no fetch por página: todos los productos se cargan al inicio en `allProducts`.

	const handleSearch = () => setActiveQuery(query);
	const handleClear = () => {
		setQuery("");
		setActiveQuery("");
		setSectionFilter("todas");
		setBranchFilter("todas");
		setSubFilter("todas");
		setPage(1);
	};

	const handleAddToCart = (product) => {
		const wasAdded = addToCart(product);

		if (wasAdded) {
			const id = Date.now();
			const newNotification = {
				id,
				message: "✓ Producto añadido al carrito"
			};

			setNotifications([newNotification]);

			setTimeout(() => {
				setNotifications((prev) => prev.filter((n) => n.id !== id));
			}, 2500);
		} else {
			setShowLimitModal(true);
		}
	};

	return (
		<div className="hc-container hc-productos">
			<Encabezado />

			<div className="cart-notifications-container">
				{notifications.map((notif) => (
					<div key={notif.id} className="cart-notification">
						{notif.message}
					</div>
				))}
			</div>

			{showLimitModal && (
				<div className="limit-modal-overlay">
					<div className="limit-modal">
						<div className="limit-modal-icon">⚠️</div>
						<h3>Cantidad máxima alcanzada</h3>
						<p>No puedes agregar más de 2 unidades por producto</p>
						<button
							className="btn btn-primary"
							onClick={() => setShowLimitModal(false)}
						>
							Entendido
						</button>
					</div>
				</div>
			)}

				<main className="hc-main hc-main-productos">
					<section className="producto-list">

						{/* TopActionButtons ahora se renderiza globalmente en App.jsx */}

						<div className="pl-filter">
						<div className="pl-search">
							<div className="pl-autocomplete-wrapper">
								<input
									type="text"
									placeholder="Buscar por nombre o código/EAN..."
									value={query}
									onChange={(e) => {
										setQuery(e.target.value);
										setActiveQuery(e.target.value);
									}}
									onFocus={() => setShowAutocomplete(true)}
									onBlur={() => setTimeout(() => setShowAutocomplete(false), 160)}
									ref={inputRef}
								/>

								{showAutocomplete && query.trim().length >= 2 && (
									<div className="pl-autocomplete" role="listbox">
										{(() => {
													const q = (query || "").trim();
													if (!q) return null;

													// Usar la misma lógica de coincidencia que el grid (sólo entre los productos ya descargados)
													const matched = fetchedProductsFlat.filter((p) => productMatchesQuery(p, q));
													if (!matched || matched.length === 0) return null;

													const qNorm = normalizeString(q);

													const prepared = matched
														.map((p) => {
															const title = decodeToPlainText(p.title?.rendered || "");
															const titleNorm = normalizeString(title);
															return { p, title, titleNorm, idx: titleNorm.indexOf(qNorm) };
														})
														.sort((a, b) => {
															if (a.idx === -1 && b.idx === -1) return a.title.localeCompare(b.title);
															if (a.idx === -1) return 1;
															if (b.idx === -1) return -1;
															return a.idx - b.idx;
														})
														.slice(0, 6);

													const seen = new Set();
													return prepared
														.filter(({ p }) => {
															if (seen.has(p.id)) return false;
															seen.add(p.id);
															return true;
														})
														.map(({ p }) => (
															<Link
																key={p.id}
																to={`/producto/${p.id}`}
																className="pl-autocomplete-item"
																onMouseDown={(e) => e.preventDefault()}>
																	    <img src={getImage(p)} alt={decodeToPlainText(p.title?.rendered)} />
																<div className="pl-autocomplete-info">
																	<div className="pl-autocomplete-title">{decodeToPlainText(p.title?.rendered)}</div>
																	<div className="pl-autocomplete-price">{p._priceText || getPrice(p.content?.rendered)}</div>
																</div>
															</Link>
														));
												})()}
									</div>
								)}
							</div>
						</div>

						<div className="pl-selects">
							<label className="pl-select">
								<span>Sección</span>
								<select
									value={sectionFilter}
									onChange={(e) => setSectionFilter(e.target.value)}
								>
									{SECTION_OPTIONS.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</label>

							<label className="pl-select">
								<span>Sucursal</span>
								<select
									value={branchFilter}
									onChange={(e) => setBranchFilter(e.target.value)}
								>
									{branchOptions.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</label>

							{/* Mostrar subcategoría sólo para Perfumeria */}
							{sectionFilter === "perfumeria" && (
								<label className="pl-select">
									<span>Subcategoría</span>
									<select
										value={subFilter}
										onChange={(e) => setSubFilter(e.target.value)}
									>
										{SUBCATEGORY_OPTIONS.map((opt) => (
											<option key={opt.value} value={opt.value}>
												{opt.label}
											</option>
										))}
									</select>
								</label>
							)}
						</div>
					</div>

						{showBranchNotice && (
							<div className="pl-branch-notice">
								<div className="pl-branch-notice__icon" aria-hidden="true">📢</div>
									<div className="pl-branch-notice__text">
										<p className="pl-branch-notice__title">Importante sobre pedidos</p>
										<p className="pl-branch-notice__body">
										En esta página, por el momento solo es posible realizar pedidos desde la sucursal HC Farma Gandhi. Si quieres confirmar stock o coordinar envíos, selecciona "HC Farma Gandhi" o contáctanos para más detalles.
										</p>
									{selectedBranch && (
										<p className="pl-branch-notice__selection">Sucursal seleccionada: {selectedBranch.label}</p>
									)}
								</div>
							</div>
						)}

					{pageLoading && (
								<>
									<p>Cargando productos...</p>
									<div className="pl-grid">
										{[...Array(6)].map((_, i) => (
											<div key={i} className="pl-card pl-skeleton">
												<div className="pl-thumb skeleton-img"></div>
												<div className="pl-info">
													<div className="skeleton-title"></div>
													<div className="skeleton-price"></div>
													<div className="skeleton-buttons"></div>
												</div>
											</div>
										))}
									</div>
								</>
							)}
					{error && <p>Error: {error}</p>}

					{!pageLoading && filteredProducts.length === 0 && (
						<div className="pl-empty-state">
							<div className="pl-empty-state__icon" aria-hidden="true">🔎</div>
							<h3 className="pl-empty-state__title">Sin resultados</h3>
							<p className="pl-empty-state__body">
								No pudimos encontrar productos con esta búsqueda. Ajusta la palabra clave o cambia la sucursal para ver más opciones.
							</p>
						</div>
					)}

					<div className="pl-grid">
						{paginatedProducts.map((p) => {
							const image = getImage(p);
							const plainTitle = decodeToPlainText(p.title?.rendered);
							const productBranches = p._branches || [];
							const displayBranches = productBranches.map((b) => BRANCH_LABELS[b] || b);
							const price = p._priceText || getPrice(p.content?.rendered);

							return (
								<article key={p.id} className="pl-card">
									<div className="pl-thumb">
										<img 
											src={image} 
											alt={plainTitle}
											loading="lazy"
											decoding="async"
										/>
									</div>

									<div className="pl-info">
										<h3 className="pl-name">{plainTitle}</h3>
										{displayBranches.length > 0 && (
											<div className="pl-branches" aria-label="Sucursales disponibles">
												{displayBranches.map((branch) => (
													<span className="pl-branch-pill" key={branch}>{branch}</span>
												))}
											</div>
										)}
										<p className="pl-price">{price}</p>

										<div className="pl-actions">
											<Link className="btn btn-secondary" to={`/producto/${p.id}`}>
												Detalles
											</Link>
											<button
												className="btn btn-primary"
												type="button"
												onClick={() => handleAddToCart(p)}
											>
												🛒 Añadir al carrito
											</button>
										</div>
									</div>
								</article>
							);
						})}
					</div>

					{/* Controles de paginación */}
					{!pageLoading && totalServerItems > 0 && (
						<div className="pl-pagination">
							<button
								className="btn"
								onClick={() => setPage((s) => Math.max(1, s - 1))}
								disabled={page <= 1}
							>
								Anterior
							</button>
							<span className="pl-pagination-info">Página {page} de {totalPages}</span>
							<button
								className="btn"
								onClick={() => setPage((s) => Math.min(totalPages, s + 1))}
								disabled={page >= totalPages}
							>
								Siguiente
							</button>
						</div>
					)}

				</section>
			</main>

			<PiePagina />
		</div>
	);
}