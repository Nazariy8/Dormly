import React from 'react'

const Footer = () => {
  return (
		<div>
			<footer>
				<nav>
					<div className="row bg-black py-2 px-5">
						<div className="col-3 d-flex title-block">
							<h1 className="title m-0">Dormly</h1>
						</div>
						<div className="col-3 d-flex justify-content-center align-items-center">
							<form class="d-flex" role="search">
								<input
									className="form-control me-2"
									type="search"
									placeholder="Знайди гуртожиток"
									aria-label="Search"
								/>
								<button class="btn btn-outline-info" type="submit">
									Пошук
								</button>
							</form>
						</div>
						<div className="col-3 mx-auto border border-warning justify-content-center links d-flex ">
							<ul className="d-flex gap-5  list-unstyled align-items-center ">
								<li>
									<a href="#" className="link btn btn-outline-info">
										Головна
									</a>
								</li>
								<li>
									<a href="#" className="link btn btn-outline-info">
										Про нас
									</a>
								</li>
								<li>
									<a href="#" className="link btn btn-outline-info">
										Контакти
									</a>
								</li>
							</ul>
						</div>
						<div className="col-3 d-flex align-items-center justify-content-center">
							<button class="btn btn-info text-white me-2">Ввійти</button>
							<button class="btn btn-primary">Зареєструватись</button>
						</div>
					</div>
				</nav>
			</footer>
		</div>
	);
}

export default Footer
