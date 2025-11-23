import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import '../css/profsets.css'; // Імпортуємо стилі

// Компонент-заглушка для елементів навігації
const Sidebar = ({ activeItem }) => (
    <div className="sidebar ps-3 p-0">
        <div className="sidebar-header">
             <a href=" " className='sidebar-title'>
            Dormly
            </a>
        </div>
        <ul className="list-unstyled components mb-0">
            <li className={activeItem === 'Редагувати профіль' ? 'active' : ''}>
                <a href="#edit" className="d-flex align-items-center"><i className="bi bi-person me-2"></i> Редагувати профіль</a>
            </li>
            <li className={activeItem === 'Фотографії' ? 'active' : ''}>
                <a href="#photos" className="d-flex align-items-center"><i className="bi bi-image me-2"></i> Фотографії</a>
            </li>
            <li className={activeItem === 'Конфіденційність' ? 'active' : ''}>
                <a href="#privacy" className="d-flex align-items-center"><i className="bi bi-lock me-2"></i> Конфіденційність</a>
            </li>
            <li className={activeItem === 'Повідомлення' ? 'active' : ''}>
                <a href="#notifications" className="d-flex align-items-center"><i className="bi bi-bell me-2"></i> Повідомлення</a>
            </li>
            <li className={activeItem === 'Обліковий запис' ? 'active' : ''}>
                <a href="#account" className="d-flex align-items-center"><i className="bi bi-gear me-2"></i> Обліковий запис</a>
            </li>
        </ul>
        <hr className="my-3"/>
        <ul className="list-unstyled components">
             <li>
                <a href="#logout" className="d-flex align-items-center"><i className="bi bi-box-arrow-right me-2"></i> Вийти</a>
            </li>
        </ul>
    </div>
);

// Компонент для секції з перемикачем (Toggle Switch)
const ToggleSetting = ({ label, subtext, isChecked, onToggle }) => (
    <div className="d-flex justify-content-between align-items-center py-2">
        <div>
            <div className="setting-label">{label}</div>
            {subtext && <small className="text-muted">{subtext}</small>}
        </div>
        <Form.Check
            type="switch"
            id={label.replace(/\s/g, '')}
            checked={isChecked}
            onChange={onToggle}
            className="custom-toggle"
        />
    </div>
);

const ProfileSettings = () => {
    // Стан для прикладів перемикачів
    const [photoPrivacy, setPhotoPrivacy] = useState(true);
    const [messagePrivacy, setMessagePrivacy] = useState(true);
    const [showActivity, setShowActivity] = useState(false);
    const [chatNotifications, setChatNotifications] = useState(true);
    const [friendRequestNotifications, setFriendRequestNotifications] = useState(true);
    const [friendActivity, setFriendActivity] = useState(false);

    return (
        <Container fluid className="profile-settings-container">
            <Row className="h-100">
                {/* Бічна панель (Sidebar) */}
                <Col md={3} className="p-0">
                    <Sidebar activeItem="Редагувати профіль" />
                </Col>

                {/* Основний контент */}
                <Col md={9} className="main-content">
                    <h2 className="mb-4">Налаштування профілю</h2>

                    {/* Хедер профілю: Фото та Ім'я */}
                    <div className="profile-header-card p-4 mb-4">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="profile-image-wrapper me-4">
                                    {/* Тут має бути зображення, використаємо заглушку */}
                                    <div className="profile-image-placeholder">
                                        <div className="image-overlay"></div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="mb-0">Alex Johnson</h3>
                                    <p className="text-muted mb-0">Змінити фото профілю</p>
                                </div>
                            </div>
                            <div className="d-flex">
                                <Button variant="outline-danger" className="me-2">Видалити</Button>
                                <Button variant="primary" className="save-photo-btn">Завантажити фото</Button>
                            </div>
                        </div>
                    </div>

                    {/* Особиста інформація */}
                    <section className="info-section">
                        <h4>Особиста інформація</h4>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Ім'я та прізвище</Form.Label>
                                <Form.Control type="text" defaultValue="Alex Johnson" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Про себе (біографія)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    defaultValue="Студент-програміст, люблю відеоігри, настільні ігри та гарну музику. Шукаю сусіда, який поважає особистий простір, але не проти іноді разом подивитись фільм."
                                />
                            </Form.Group>
                        </Form>
                    </section>

                    {/* Хобі та інтереси */}
                    <section className="info-section mt-4">
                        <h4>Хобі та інтереси</h4>
                        <div className="d-flex flex-wrap mb-3">
                            <span className="tag-pill me-2">Відеоігри <i className="bi bi-x"></i></span>
                            <span className="tag-pill me-2">Настільні ігри <i className="bi bi-x"></i></span>
                            <span className="tag-pill me-2">Музика <i className="bi bi-x"></i></span>
                            <span className="tag-pill add-tag">+ Додати тег...</span>
                        </div>
                    </section>

                    {/* Звички */}
                    <section className="info-section mt-4">
                        <h4>Звички</h4>
                        <Row>
                            <Col md={6}>
                                <Form.Label>Режим сну</Form.Label>
                                <div className="d-flex sleep-mode-switch">
                                    <Button
                                        variant="link"
                                        className="sleep-option active" // "Сова" активна
                                    >
                                        Сова
                                    </Button>
                                    <Button
                                        variant="link"
                                        className="sleep-option"
                                    >
                                        Жайворонок
                                    </Button>
                                </div>
                            </Col>
                            <Col md={6}>
                                <Form.Label>Ставлення до прибирання</Form.Label>
                                <Form.Select defaultValue="Прибираю регулярно">
                                    <option>Прибираю регулярно</option>
                                    <option>Прибираю час від часу</option>
                                    <option>Не прибираю</option>
                                </Form.Select>
                            </Col>
                        </Row>
                    </section>
                    
                    {/* Налаштування конфіденційності */}
                    <section className="info-section mt-4 privacy-box p-4">
                        <h4 className="privacy-header d-flex align-items-center"><i className="bi bi-lock-fill me-2"></i> Налаштування конфіденційності</h4>
                        <hr/>
                        <ToggleSetting
                            label="Хто може бачити мої фотографії"
                            subtext="Всі користувачі"
                            isChecked={photoPrivacy}
                            onToggle={() => setPhotoPrivacy(!photoPrivacy)}
                        />
                        <ToggleSetting
                            label="Хто може надсилати мені повідомлення"
                            subtext="Лише взаємні контакти"
                            isChecked={messagePrivacy}
                            onToggle={() => setMessagePrivacy(!messagePrivacy)}
                        />
                        <ToggleSetting
                            label="Приховати мою активність"
                            subtext="Ваш статус онлайн не буде видимим"
                            isChecked={showActivity}
                            onToggle={() => setShowActivity(!showActivity)}
                        />
                    </section>
                    
                    {/* Налаштування повідомлень */}
                    <section className="info-section mt-4 privacy-box p-4">
                        <h4 className="privacy-header d-flex align-items-center"><i className="bi bi-bell-fill me-2"></i> Налаштування повідомлень</h4>
                        <hr/>
                        <ToggleSetting
                            label="Нові повідомлення в чаті"
                            subtext="Push-сповіщення, E-mail"
                            isChecked={chatNotifications}
                            onToggle={() => setChatNotifications(!chatNotifications)}
                        />
                        <ToggleSetting
                            label="Запити на додавання в друзі"
                            subtext="Push-сповіщення"
                            isChecked={friendRequestNotifications}
                            onToggle={() => setFriendRequestNotifications(!friendRequestNotifications)}
                        />
                        <ToggleSetting
                            label="Активність друзів"
                            subtext="Вимкнено"
                            isChecked={friendActivity}
                            onToggle={() => setFriendActivity(!friendActivity)}
                        />
                    </section>
                    
                    {/* Кнопки збереження */}
                    <div className="d-flex justify-content-end mt-5 mb-4">
                        <Button variant="link" className="text-decoration-none me-3 save-cancel-btn">Скасувати</Button>
                        <Button variant="primary" className="save-changes-btn">Зберегти зміни</Button>
                    </div>

                </Col>
            </Row>
        </Container>
    );
};

export default ProfileSettings;