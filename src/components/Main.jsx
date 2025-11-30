import React from "react";
import Intro from "./Intro";
import Advan from "./Advan";
import Feedbacks from "./Feedbacks";


const Main = () => {
  return (
		<div>
			<header>
				<nav className="navbar navbar-expand-lg bg-body-tertiary rounded-4">
					<div className="container-fluid">
						<h1 className="title m-0">
							<a className="" href="/">
								Dormly
							</a>
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
									<a
										className="nav-link link px-3"
										aria-current="page"
										href="/aboutUs"
									>
										Питання
									</a>
								</li>
								<li className="nav-item">
									<a
										className="nav-link link px-3"
										aria-current="page"
										href="/#advantage-heading"
									>
										Переваги
									</a>
								</li>
								<li className="nav-item">
									<a className="nav-link link px-3" href="/#feedbacks-heading">
										Відгуки
									</a>
								</li>
								<li className="nav-item">
									<a className="nav-link login link px-3" href="/login">
										Ввійти
									</a>
								</li>
								<li className="nav-item">
									<a className="nav-link signup link px-3 rounded-4" href="/regist">
										Зареєструватись
									</a>
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
			<Intro />
			<Advan />
			<Feedbacks />
		</div>
	);
}

export default Main;

