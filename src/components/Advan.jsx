import React from "react";

const Advan = () => {
	return (
		<div>
			<section className="advantages-section">
				<h6 className="section-pretitle">Переваги платформи</h6>
				<div className="row">
					<div className="col"></div>
				</div>
				<h2 className="section-title" id="advantage-heading">
					Чому обирають <span className="accent">Dormly?</span>
				</h2>
				<p className="section-text">
					Ми допомагаємо створити комфортне та безпечне середовище для життя.{" "}
				</p>
				<div className="container-fluid">
					<div className="row advantages d-flex justify-content-center">
						<div className="col-9 col-xl-4 col-xxl-3 my-3 col-lg-4 col-md-4 col-sm-5 advantage-card mx-3 p-5">
							<div className="icon mx-auto">
								<i className=" bi bi-shield-check"></i>
							</div>
							<h4>Безпека</h4>
							<p>
								Ми перевірямо кожного користувача, щоб забезпечити вашу безпеку
								та спокій.
							</p>
						</div>
						<div className="col-9 col-xl-4 col-xxl-3 my-3 col-lg-4 col-md-4 col-sm-5 advantage-card mx-3 p-5">
							<div className="icon mx-auto">
								<i className=" bi bi-person-check-fill"></i>
							</div>
							<h4>Сумісність</h4>
							<p>
								Наш алгоритм на основі тесту особистості підбирає ідеального
								сусіда для вас
							</p>
						</div>
						<div className="col-9 col-xl-8 col-xxl-3  my-3 col-lg-9 col-md-9 col-sm-5 advantage-card mx-3 p-5">
							<div className="icon mx-auto">
								<i className=" bi bi-people-fill"></i>
							</div>
							<h4>Спільнота</h4>
							<p>
								Приєднуйтесь до спільноти студентів та знаходьте нових друзів у
								вашому гуртожитку.
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Advan;
