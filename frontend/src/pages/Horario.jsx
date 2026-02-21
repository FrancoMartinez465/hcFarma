import React, { useState } from "react";
import "../assets/css/horario.css";
import Encabezado from "../components/Encabezado";
import TopActionButtons from "../components/TopActionButtons";
import PiePagina from "../components/PiePagina";


const branches = [
	{
    id: "ghandi",
    name: "Hc Farma Gandhi",
    phone: "+54 9 3517 51-7088",
    address: "Av. Mahatma Gandhi 651, X5003, Córdoba, Argentina",
    mapsLink: "https://maps.app.goo.gl/5ZJ3DuU5ZuQh6aSL9",
    email: "farmaciahcfarma@gmail.com",
    schedule: [
      { day: "Lunes", ranges: [["09:00", "21:00"]] },
      { day: "Martes", ranges: [["09:00", "21:00"]] },
      { day: "Miércoles", ranges: [["09:00", "21:00"]] },
      { day: "Jueves", ranges: [["09:00", "21:00"]] },
      { day: "Viernes", ranges: [["09:00", "21:00"]] },
      { day: "Sábado", ranges: [["09:00", "21:00"]] },
      { day: "Domingo", ranges: [["10:00", "14:00"], ["17:00", "21:00"]] },
    ],
  },
  {
    id: "ruta20",
    name: "Hc Farma Ruta 20",
    phone: "+54 9 351 466-6909",
    address: "Av. Fuerza Aérea Argentina 2475, X5010 Córdoba, Argentina",
    mapsLink: "https://maps.app.goo.gl/kLoK7gTM9G3vedD76",
    email: "farmaciahcfarma@gmail.com",
    schedule: [
      { day: "Lunes", ranges: [["09:00", "14:00"], ["16:00", "21:30"]] },
      { day: "Martes", ranges: [["09:00", "14:00"], ["16:00", "21:30"]] },
      { day: "Miércoles", ranges: [["09:00", "14:00"], ["16:00", "21:30"]] },
      { day: "Jueves", ranges: [["09:00", "14:00"], ["16:00", "21:30"]] },
      { day: "Viernes", ranges: [["09:00", "14:00"], ["16:00", "21:30"]] },
      { day: "Sábado", ranges: [["09:00", "14:00"], ["16:00", "21:30"]] },
      { day: "Domingo", ranges: [] },
    ],
  },
  {
    id: "sanmartin",
    name: "Hc Farma San Martin",
    phone: "+54 9 351 878-2427",
    address: "Federico Brandsen 141, X5000GMD Córdoba, Argentina",
    mapsLink: "https://maps.app.goo.gl/K5mqC4HrumTXMwFdA",
    email: "farmaciahcfarma@gmail.com",
    schedule: [
      { day: "Lunes", ranges: [["09:00", "14:00"], ["16:00", "21:30"]] },
      { day: "Martes", ranges: [["09:00", "14:00"], ["16:00", "21:30"]] },
      { day: "Miércoles", ranges: [["09:00", "14:00"], ["16:00", "21:30"]] },
      { day: "Jueves", ranges: [["09:00", "14:00"], ["16:00", "21:30"]] },
      { day: "Viernes", ranges: [["09:00", "14:00"], ["16:00", "21:30"]] },
      { day: "Sábado", ranges: [["09:00", "14:00"], ["16:00", "21:30"]] },
      { day: "Domingo", ranges: [] },
    ],
  },
];

function parseHM(hm) {
	const [h, m] = hm.split(":").map(Number);
	return h * 60 + m;
}

function isOpenNow(schedule) {
	if (!schedule) return false;
	const now = new Date();
	const days = [
		"Domingo",
		"Lunes",
		"Martes",
		"Miércoles",
		"Jueves",
		"Viernes",
		"Sábado",
	];
	const today = days[now.getDay()];
	const dayEntry = schedule.find((d) => d.day === today);
	if (!dayEntry) return false;
	const nowMinutes = now.getHours() * 60 + now.getMinutes();
	return dayEntry.ranges.some(([start, end]) => {
		const s = parseHM(start);
		const e = parseHM(end);
		return nowMinutes >= s && nowMinutes <= e;
	});
}

export default function Horario() {
	const [selectedBranchId, setSelectedBranchId] = useState("ghandi");
	const selectedBranch = branches.find((b) => b.id === selectedBranchId);
	const abierto = isOpenNow(selectedBranch.schedule);

	return (
		<div>
			<Encabezado />
			<TopActionButtons />
			<main className="horario-container">
				<h2 className="horario-title">Sucursales y horarios</h2>

				<div style={{
					marginBottom: "30px",
					padding: "20px",
					backgroundColor: "#fff3cd",
					borderLeft: "6px solid #ffc107",
					borderRadius: "8px",
					display: "flex",
					alignItems: "center",
					gap: "15px",
					boxShadow: "0 4px 12px rgba(255, 193, 7, 0.2)"
				}}>
					<div style={{
						fontSize: "32px",
						flexShrink: 0
					}}>
						⚠️
					</div>
					<div>
						<p style={{
							margin: "0",
							fontWeight: "700",
							color: "#856404",
							fontSize: "16px"
						}}>
							ATENCIÓN
						</p>
						<p style={{
							margin: "5px 0 0 0",
							color: "#856404",
							fontSize: "14px"
						}}>
							Por el momento, los pedidos en sucursal solo están disponibles en <strong>Hc Farma Gandhi</strong>
						</p>
					</div>
				</div>

				<div style={{
					marginBottom: "40px",
					padding: "30px",
					background: "linear-gradient(135deg, #0066cc 0%, #00b4d8 100%)",
					borderRadius: "16px",
					border: "none",
					display: "flex",
					flexDirection: "column",
					gap: "16px",
					boxShadow: "0 12px 40px rgba(0, 102, 204, 0.25)",
					position: "relative",
					overflow: "hidden"
				}}>
					<div style={{
						position: "absolute",
						top: "-40%",
						right: "-20%",
						width: "400px",
						height: "400px",
						background: "rgba(255,255,255,0.08)",
						borderRadius: "50%",
						pointerEvents: "none"
					}}></div>
					<div style={{
						position: "absolute",
						bottom: "-30%",
						left: "-10%",
						width: "250px",
						height: "250px",
						background: "rgba(255,255,255,0.06)",
						borderRadius: "50%",
						pointerEvents: "none"
					}}></div>
					<label htmlFor="branch-select" style={{
						fontWeight: "700",
						fontSize: "20px",
						color: "#fff",
						margin: 0,
						textShadow: "0 2px 8px rgba(0,0,0,0.15)",
						zIndex: 1,
						letterSpacing: "0.5px"
					}}>
						Elige tu sucursal favorita
					</label>
					<select
						id="branch-select"
						value={selectedBranchId}
						onChange={(e) => setSelectedBranchId(e.target.value)}
						style={{
							padding: "15px 20px",
							fontSize: "17px",
							fontWeight: "600",
							borderRadius: "10px",
							border: "none",
							backgroundColor: "#fff",
							color: "#1e7e34",
							cursor: "pointer",
							boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
							transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
							minWidth: "100%",
							appearance: "none",
							backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231e7e34' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
							backgroundRepeat: "no-repeat",
							backgroundPosition: "right 15px center",
							backgroundSize: "22px",
							paddingRight: "50px",
						}}
						onMouseOver={(e) => {
							e.target.style.transform = "translateY(-3px)";
							e.target.style.boxShadow = "0 10px 28px rgba(0, 102, 204, 0.3)";
						}}
						onMouseOut={(e) => {
							e.target.style.transform = "translateY(0)";
							e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
						}}
					>
						{branches.map((branch) => (
							<option key={branch.id} value={branch.id}>
								{branch.name}
							</option>
						))}
					</select>
				</div>

				<div className="horario-card" role="region" aria-label={`Horarios ${selectedBranch.name}`}>
					<div className="branch-header">
						<div>
							<h3 className="branch-name">{selectedBranch.name}</h3>
							<div className="branch-phone">{selectedBranch.phone}</div>
						</div>
						<div style={{ textAlign: "right" }}>
							<div className={abierto ? "status-open" : "status-closed"}>{abierto ? "Abierto ahora" : "Cerrado"}</div>
						</div>
					</div>

					<div className="schedule-list">
						{selectedBranch.schedule.map((d) => (
							<div key={d.day} className="schedule-row">
								<div className="schedule-day">{d.day}</div>
								<div className="schedule-ranges">
									{d.ranges.length > 0
										? d.ranges.map((r, i) => (
												<span key={i} style={{ display: "block" }}>
													{r[0]} - {r[1]}
												</span>
											))
										: "Cerrado"}
								</div>
							</div>
						))}
					</div>

					<div className="branch-info">{selectedBranch.address}</div>
					<div className="branch-email">{selectedBranch.email}</div>

					<div className="card-actions">
						<a className="btn-action btn-call" href={`tel:${selectedBranch.phone.replace(/[^0-9+]/g, "")}`}>📞 Llamar</a>
						<a
							className="btn-action btn-email"
							target="_blank"
							rel="noopener noreferrer"
							href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedBranch.email)}&su=${encodeURIComponent(
								"Consulta desde HcFarma"
							)}`}
						>
							✉️ Enviar email
						</a>
					</div>

					<div className="map-embed-wrapper">
						<iframe
							title={`Mapa ${selectedBranch.name}`}
							className="map-embed"
							src={`https://www.google.com/maps?q=${encodeURIComponent(selectedBranch.address)}&output=embed&z=18`}
							loading="lazy"
						/>
					</div>
				</div>

				{/* Productos list removed from Horario to avoid duplicate rendering and navigation errors */}
			</main>
			<PiePagina />
		</div>
	);
}
