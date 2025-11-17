import React, { useState } from "react";
import googleicon from "../img/icons/google.png";
import Advan from "./../components/Advan";

function UserInit(props) {
	const [showPassword, setShowPassword] = useState(false);
	const [isInited, setIsInited] = useState(false);


	const [email, setEmail] = useState(""); 
	const [password, setPassword] = useState("");

	function changeShowPassword() {
		if (showPassword) {
			setShowPassword(false);
		} else {
			setShowPassword(true);
		}
	}

	function checkEmailInput() {
		if (email.includes(`"`) || email.includes(`£`)|| email.includes(`#`)|| email.includes(`%`)|| email.includes(`^`)
		|| email.includes(`&`)|| email.includes(`*`)|| email.includes(`(`)|| email.includes(`)`)){
			alert("Введіть email вірно!");
		}
	}
	function checkPasswordInput() {}

	return (
		<div>
			<section className="login-section px-3">
				<a href="/" className="back-btn d-flex align-items-center">
					<i className="bi bi-arrow-left fs-5 me-2"></i>
					На головну
				</a>
				<form action="" className="">
					<h3>Ласкаво просимо!</h3>
					<p>Знайди свого ідеального сусіда по кімнаті</p>
					<span>Email</span>
					<input
						type="email"
						className="mb-2"
						name=""
						// id=""
						placeholder="Ваш email"
						required
						// title="Please provide only a Best Startup Ever corporate email address"
						maxLength="64"
					/>

					<span>Пароль</span>
					<div className="input-password w-100">
						<input
							type={showPassword ? "text" : "password"}
							name=""
							id=""
							placeholder="Пароль"
							className="mb-2 w-100"
							required
							onChange={(e) => setEmail(e.target.value)}
						/>
						<a href="#" className="text-dark showpass-btn-block">
							<i
								className={`bi ${
									showPassword ? "bi-eye" : "bi-eye-slash"
								} fs-4 position-absolute`}
								id="showpass-btn"
								onClick={changeShowPassword}
							></i>
						</a>
					</div>
					<div className="row after-password-spans d-flex justify-content-between align-items-center">
						<span className="col-6 mb-4 range text-secondary">
							Має бути 8-20 символів{" "}
						</span>
					</div>

					{props.goal == "reg" ? 
					
						<>
							<div className="input-password w-100">
						<input
							type={showPassword ? "text" : "password"}
							name=""
							// id=""
							placeholder="Пароль"
							className="mb-2 w-100"
							required
						/>
						<a href="#" className="text-dark showpass-btn-block">
							<i
								className={`bi ${
									showPassword ? "bi-eye" : "bi-eye-slash"
								} fs-4 position-absolute`}
								id="showpass-btn"
								onClick={changeShowPassword}
							></i>
						</a>
					</div>
						</>
				 : <>
				</>}
					<button className="w-100 log-reg-btn w-100" onClick={checkEmailInput}>
						{props.goal == "log" ? "Увійти" : "Зареєструватися"}
					</button>
					<hr></hr>
					<div className="or-span">
						<span className="fw-normal text-center ">або</span>
					</div>
					<a href="" className="text-dark googlelogin-btn p-2">
						<span className="p-0 m-0">
							<img src={googleicon} className="googleicon" alt="" />
						</span>
						Продовжити з <span className="p-0 m-0 ms-1">Google</span>
					</a>

					<p className="question">
						{props.goal == "log" ? (
							<>
								Ще немаєте аккаунту?
								<a href="/userinit/regist" className="regist-link ms-2">
									Реєстрація
								</a>
							</>
						) : (
							<>
								Вже маєте аккаунт?
								<a href="/userinit/login" className="regist-link ms-2">
									Увійти
								</a>
							</>
						)}
					</p>
				</form>

				{props.goal == "reg" ? (
					<>
						<div className="row d-flex justify-content-center">
							<div className="col-8">
								<p className="terms">
									Реєструючись, ви погоджуєтесь з нашими{" "}
									<span className="accent">Умовами використання</span> та{" "}
									<span className="accent">Політикою конфіденційності.</span>
								</p>
							</div>
						</div>
					</>
				) : (
					""
				)}
			</section>
		</div>
	);
}

export default UserInit;
