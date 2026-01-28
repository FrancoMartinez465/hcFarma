import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../assets/css/producto-list.css";
import Encabezado from "../components/Encabezado";
import PiePagina from "../components/PiePagina";
import { useCart } from "../context/CartContext";
import logo from "../assets/images/image.png";

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

const SUBCATEGORY_OPTIONS = [
	{ value: "todas", label: "Todas" },
	{ value: "masculino", label: "Masculino" },
	{ value: "femenino", label: "Femenino" }
];
export default function ProductoList() {
	const { addToCart } = useCart();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [query, setQuery] = useState("");
	const [activeQuery, setActiveQuery] = useState("");
	const [notifications, setNotifications] = useState([]);
	const [showLimitModal, setShowLimitModal] = useState(false);
	const [sectionFilter, setSectionFilter] = useState("todas");
	const [branchFilter, setBranchFilter] = useState("todas");
	const [subFilter, setSubFilter] = useState("todas");
	const [categoriesMap, setCategoriesMap] = useState({});
	const [branchOptions] = useState(BRANCH_OPTIONS);

	const selectedBranch = branchOptions.find((b) => b.value === branchFilter);
	const showBranchNotice = branchFilter !== "todas" && branchFilter !== "hc farma gandhi";

	useEffect(() => {
		const fetchAllPosts = async () => {
			try {
				let allPosts = [];
				let page = 1;
				let totalPages = 1;
				const basePostsUrl =
					"https://public-api.wordpress.com/wp/v2/sites/hcfarma.wordpress.com/posts";

				do {
					const res = await fetch(
						`${basePostsUrl}?per_page=100&page=${page}&_embed=1`
					);

					if (!res.ok) throw new Error("Error al cargar productos");

					totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
					const data = await res.json();
					allPosts = [...allPosts, ...data];
					page++;
				} while (page <= totalPages);

				// categorías
				const catRes = await fetch(
					"https://public-api.wordpress.com/wp/v2/sites/hcfarma.wordpress.com/categories?per_page=100"
				);
				if (!catRes.ok) throw new Error("Error al cargar categorias");
				const categoriesData = await catRes.json();

				const normalize = (s) =>
					String(s || "")
						.toLowerCase()
						.normalize("NFD")
						.replace(/\p{Diacritic}/gu, "")
						.replace(/[^a-z0-9]+/g, " ")
						.trim();

				const map = categoriesData.reduce((acc, cat) => {
					acc[cat.id] = {
						name: cat.name,
						slug: cat.slug,
						normName: normalize(cat.name),
						normSlug: normalize(cat.slug)
					};
					return acc;
				}, {});

				setCategoriesMap(map);

				const mapBranches = (html) => {
					if (!html) return [];
					try {
						const snippet = String(html).slice(0, 1000);
						const text = snippet.replace(/<[^>]+>/g, " ").replace(/\u00A0/g, " ").toLowerCase();
						const branches = new Set();
						if (/\bgandhi\b/.test(text)) branches.add("hc farma gandhi");
						if (/\bruta\s*20\b/.test(text)) branches.add("hc farma ruta 20");
						if (/\bsan\s*martin\b/.test(text)) branches.add("hc farma san martin");
						return Array.from(branches);
					} catch (e) {
						return [];
					}
				};

				const enhanced = allPosts.map((p) => ({
					...p,
					_branches: mapBranches(p.content?.rendered)
				}));

				setProducts(enhanced);
				console.log("TOTAL PRODUCTOS:", enhanced.length);
				setLoading(false);
			} catch (err) {
				setError(err.message);
				setLoading(false);
			}
		};

		fetchAllPosts();
	}, []);

	// Helpers
	const getImage = (html) =>
		html?.match(/<img[^>]+src="([^">]+)"/)?.[1] || logo;

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


	const filteredProducts = products.filter((p) => {
		const normalizedQuery = (activeQuery || query).trim().toLowerCase();
		const normalizedQueryDigits = normalizedQuery.replace(/\D/g, "");
		const titleMatch = decodeToText(p.title?.rendered).includes(normalizedQuery);
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
		const categoryNames = (p.categories || [])
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
			// Mostrar si no es product exclusivo de 1 sola sucursal
			matchesBranch = productBranches.length !== 1;
		} else {
			// Para una sucursal seleccionada: mostrar si el producto lista esa sucursal
			// o si no tiene info de sucursales (asumir disponible en todas).
			matchesBranch = productBranches.length === 0 || productBranches.includes(branchFilter);
		}

		// Si hay una búsqueda activa (query no vacía), ignorar filtros de sección y sucursal
		const isSearching = normalizedQuery.length > 0;
		const finalMatchesSection = isSearching ? true : (matchesSection && matchesSub);
		const finalMatchesBranch = isSearching ? true : matchesBranch;

		return (titleMatch || codeMatch) && finalMatchesSection && finalMatchesBranch;
	});

	const handleSearch = () => setActiveQuery(query);
	const handleClear = () => {
		setQuery("");
		setActiveQuery("");
		setSectionFilter("todas");
		setBranchFilter("todas");
		setSubFilter("todas");
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

					<div className="pl-filter">
						<div className="pl-search">
							<input
								type="text"
								placeholder="Buscar por nombre o código/EAN..."
								value={query}
								onChange={(e) => {
									setQuery(e.target.value);
									setActiveQuery(e.target.value);
								}}
							/>
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

					{loading && (
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

					{!loading && filteredProducts.length === 0 && (
						<div className="pl-empty-state">
							<div className="pl-empty-state__icon" aria-hidden="true">🔎</div>
							<h3 className="pl-empty-state__title">Sin resultados</h3>
							<p className="pl-empty-state__body">
								No pudimos encontrar productos con esta búsqueda. Ajusta la palabra clave o cambia la sucursal para ver más opciones.
							</p>
						</div>
					)}

					<div className="pl-grid">
						{filteredProducts.map((p) => {
							const image = getImage(p.content?.rendered);
							const plainTitle = decodeToPlainText(p.title?.rendered);
							const productBranches = p._branches || [];
							const displayBranches = productBranches.map((b) => BRANCH_LABELS[b] || b);
							const price = getPrice(p.content?.rendered);

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

				</section>
			</main>

			<PiePagina />
		</div>
	);
}