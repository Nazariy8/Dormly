import React from "react";
import user1 from "../img/main-feedback-users/user1.png"
import user2 from "../img/main-feedback-users/user2.png"
import user3 from "../img/main-feedback-users/user3.png"

const Feedbacks = () => {
	return (
		<div>
			<section className="feedbacks-section py-5">
				<div className="text text-center">
					<h3 className="section-minititle" id="feedbacks-heading">Що кажуть наші користувачі</h3>
					<p>
						Історії успіху від студентів, які знайшли ідеальних сусідів з
						Dormly.
					</p>
				</div>
				<div className="container-fluid">
					<div className="row feedbacks d-flex justify-content-center">
						<div className="col-9 col-xxl-3 my-3 col-lg-9 col-md-9 col-sm-5 feedback-card p-5 mx-3">
							<div className="user-info-block">
								<div className="user-avatar">
									<img src={user1} alt="" />
								</div>
								<div className="user-info">
									<h4>Олена К.</h4>
									<h5>Студентка, 1-курс</h5>
								</div>
							</div>
							<div className="feedback-text">
								<p>
									"Dormly допоміг мені знайти не просто сусіда, а справжню
									подругу! Ми чудово ладнаємо, і наше спільне проживання - це
									суцільне задоволення."
								</p>
							</div>
						</div>
						<div className="col-9 col-xxl-3 my-3 col-lg-9 col-md-9 col-sm-5 feedback-card p-5 mx-3">
							<div className="user-info-block">
								<div className="user-avatar">
									<img src={user2} alt="" />
								</div>
								<div className="user-info">
									<h4>Максим П.</h4>
									<h5>Студент, 2-курс</h5>
								</div>
							</div>
							<div className="feedback-text">
								<p>
									"Я був скептично налаштований, але тест дійсно працює. Мій
									сусід по кімнаті - спокійна та охайна людина, саме те, що я
									шукав."
								</p>
							</div>
						</div>
						<div className="col-9 col-xxl-3 my-3 col-lg-9 col-md-9 col-sm-5 feedback-card p-5 mx-3">
							<div className="user-info-block">
								<div className="user-avatar">
									<img src={user3} alt="" />
								</div>
								<div className="user-info">
									<h4>Ірина Л.</h4>
									<h5>Студентка, 3-курс</h5>
								</div>
							</div>
							<div className="feedback-text">
								<p>
									"Завдяки платформі я уникнула багатьох конфліктів, які були у
									моїх друзів з їхніми сусідами. Дуже рекомендую всім
									першокурсникам!"
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Feedbacks;
