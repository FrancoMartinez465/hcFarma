import React, { useState, useMemo } from "react";
import "../assets/css/horario.css";
import Encabezado from "../components/Encabezado";
import PiePagina from "../components/PiePagina";


const branches = [
  {
    id: "ghandi",
    name: "Hc Farma Gandhi",
    phone: "+54 9 3517 51-7088",
    address: "Av. Mahatma Gandhi 651, X5003, Córdoba, Argentina",
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
	const [selected, setSelected] = useState(branches[0].id);

	const branch = useMemo(
		() => branches.find((b) => b.id === selected) || branches[0],
		[selected]
	);

	const abierto = isOpenNow(branch.schedule);

	return (
		<div>
			<Encabezado />
			<main className="horario-container">
				<h2 className="horario-title">Sucursales y horarios</h2>

				<div className="select-branch">
					<label htmlFor="branch-select">Seleccionar sucursal:</label>
					<select id="branch-select" value={selected} onChange={(e) => setSelected(e.target.value)}>
						{branches.map((b) => (
							<option key={b.id} value={b.id}>
								{b.name}
							</option>
						))}
					</select>
				</div>

				<div className="horario-card" role="region" aria-label={`Horarios ${branch.name}`}>
					<div className="branch-header">
						<div>
							<h3 className="branch-name">{branch.name}</h3>
							<div className="branch-phone">{branch.phone}</div>
						</div>
						<div style={{ textAlign: "right" }}>
							<div className={abierto ? "status-open" : "status-closed"}>{abierto ? "Abierto ahora" : "Cerrado"}</div>
						</div>
					</div>

					<div className="schedule-list">
						{branch.schedule.map((d) => (
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

					<div className="branch-info">{branch.address}</div>
					<div className="branch-email">{branch.email}</div>

					<div className="card-actions">
										<a className="btn-action btn-call" href={`tel:${branch.phone.replace(/[^0-9+]/g, "")}`}>📞 Llamar</a>
												<a
													className="btn-action btn-email"
													target="_blank"
													rel="noopener noreferrer"
													href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(branch.email)}&su=${encodeURIComponent(
														"Consulta desde HcFarma"
													)}`}
												>
													✉️ Enviar email
												</a>
					</div>

					<div className="map-embed-wrapper">
						<iframe
							title={`Mapa ${branch.name}`}
							className="map-embed"
							src={`https://www.google.com/maps?q=${encodeURIComponent(branch.address)}&output=embed`}
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

