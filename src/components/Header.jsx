import React from "react";
// 👇 1. Імпортуємо Link
import { Link } from "react-router-dom";

const Header = () => {
	return (
		<div>
			<header>
				<nav className="navbar navbar-expand-lg bg-body-tertiary rounded-4">
					<div className="container-fluid">
						<h1 className="title m-0">
							
							<Link className="" to="/">
								Dormly
							</Link>
						</h1>
						<button
							className="navbar-toggler"
							type="button"
							data-bs-toggle="collapse"
							data-bs-target="#navbarSupportedContent"
							aria-controls="navbarSupportedContent"
							aria-expanded="false"
							aria-label="Toggle navigation"
						>
							<span className="navbar-toggler-icon"></span>
						</button>
						<div
							className="navbar-collapse collapse text-end"
							id="navbarSupportedContent"
						>
							<ul className="navbar-nav text-start mb-2 mb-lg-0">
								<li className="nav-item">
									<Link
										className="nav-link link px-3"
										aria-current="page"
										to="/aboutUs"
									>
										Питання
									</Link>
								</li>
								{/* ⚠️ Зверни увагу: для якорів (#) Link може працювати некоректно зі скролом.
                                    Але href="/#..." точно зламає сайт на GitHub Pages (викине на білий екран).
                                    Я тимчасово замінив їх на перехід на головну. 
                                    Для плавного скролу краще використати бібліотеку 'react-router-hash-link',
                                    але щоб прибрати помилку 404 — цей варіант підійде.
                                */}
								<li className="nav-item">
									<a className="nav-link link px-3" href="#advantage-heading">
										Переваги
									</a>
								</li>
								<li className="nav-item">
									<a className="nav-link link px-3" href="#feedbacks-heading">
										Відгуки
									</a>
								</li>
								<li className="nav-item">
									{/* 👇 Головне виправлення для логіну */}
									<Link className="nav-link login link px-3" to="/login">
										Ввійти
									</Link>
								</li>
								<li className="nav-item">
									{/* 👇 Головне виправлення для реєстрації */}
									<Link className="nav-link signup link px-3 rounded-4" to="/regist">
										Зареєструватись
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</nav>
				<div
					className="modal fade"
					id="loginModal"
					tabIndex="-1"
					aria-labelledby="exampleModalLabel"
					aria-hidden="true"
				>
				</div>
			</header>
		</div>
	);
};

export default Header;