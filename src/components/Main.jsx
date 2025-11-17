import React from "react";
import Intro from "./Intro";
import Advan from "./Advan";
import Feedbacks from "./Feedbacks";


const Main = () => {
  return (
		<div>
			<header>
				<nav class="navbar navbar-expand-lg bg-body-tertiary rounded-4">
					<div class="container-fluid">
						<h1 className="title m-0">
							<a class="" href="/">
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
									<a
										class="nav-link link px-3"
										aria-current="page"
										href="/aboutUs"
									>
										Питання
									</a>
								</li>
								<li class="nav-item">
									<a
										class="nav-link link px-3"
										aria-current="page"
										href="#advantage-heading"
									>
										Переваги
									</a>
								</li>
								<li class="nav-item">
									<a class="nav-link link px-3" href="#feedbacks-heading">
										Відгуки
									</a>
								</li>
								<li class="nav-item">
									<a class="nav-link login link px-3" href="/userinit/login">
										Ввійти
									</a>
								</li>
								<li class="nav-item">
									<a class="nav-link signup link px-3 rounded-4" href="/userinit/regist">
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
				</div>
			</header>
			<Intro />
			<Advan />
			<Feedbacks />
		</div>
	);
}

export default Main;

