import React from "react";

const Header = () => {
	return (
		<div>
			<header>
				<nav class="navbar navbar-expand-lg bg-body-tertiary rounded-4">
					<div class="container-fluid">
						<h1 className="title m-0">
							<a class="" href="#">
								Dormly
							</a>
						</h1>
						<button
							class="navbar-toggler"
							type="button"
							data-bs-toggle="collapse"
							data-bs-target="#navbarSupportedContent"
							aria-controls="navbarSupportedContent"
							aria-expanded="false"
							aria-label="Toggle navigation"
						>
							<span class="navbar-toggler-icon"></span>
						</button>
						<div
							class="navbar-collapse collapse text-end"
							id="navbarSupportedContent"
						>
							<ul class="navbar-nav text-start mb-2 mb-lg-0">
								<li class="nav-item">
									<a class="nav-link link px-3" aria-current="page" href="#">
										Питання
									</a>
								</li>
								<li class="nav-item">
									<a class="nav-link link px-3" aria-current="page" href="#">
										Переваги
									</a>
								</li>
								<li class="nav-item">
									<a class="nav-link link px-3" href="#">
										Відгуки
									</a>
								</li>
								<li class="nav-item">
									<a
										class="nav-link login link px-3"
										data-bs-toggle="modal"
										data-bs-target="#loginModal"
										href="#"
									>
										Ввійти
									</a>
								</li>
								<li class="nav-item">
									<a class="nav-link signup link px-3 rounded-4" href="#">
										Зареєструватись
									</a>
								</li>
							</ul>
						</div>
					</div>
				</nav>
				<div
					class="modal fade"
					id="loginModal"
					tabindex="-1"
					aria-labelledby="exampleModalLabel"
					aria-hidden="true"
				>
					<div class="modal-dialog modal-dialog-centered">
						<div class="modal-content">
							<div class="modal-header">
								<div className="modal-header-text text-center">
									<h1 class="modal-title fs-5" id="exampleModalLabel">
										Ласкаво просимо!
									</h1>
									<p>Знайди свого ідеального сусіда по кімнаті</p>
								</div>

								<button
									type="button"
									class="btn-close"
									data-bs-dismiss="modal"
									aria-label="Close"
								></button>
							</div>
							<div class="modal-body">...</div>
							<div class="modal-footer">
								<button
									type="button"
									class="btn btn-secondary"
									data-bs-dismiss="modal"
								>
									Close
								</button>
								<button type="button" class="btn btn-primary">
									Save changes
								</button>
							</div>
						</div>
					</div>
				</div>
			</header>
		</div>
	);
};

export default Header;
