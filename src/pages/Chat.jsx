import React from 'react';


const ChatLayout = () => {
  return (
    <div className="container-fluid vh-100 d-flex flex-column" style={{ backgroundColor: '#121212', color: '#ffffff' }}>
      
      {/* Твоє верхнє меню (Navbar) Dormly може бути тут або вище */}

      <div className="row flex-grow-1 overflow-hidden">
        
        {/* ЛІВА ПАНЕЛЬ: Список чатів */}
        <div className="col-12 col-md-4 col-lg-3 border-end border-secondary d-flex flex-column p-0">
          <div className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center">
            <h4 className="m-0">Чати</h4>
            <i className="bi bi-three-dots"></i>
          </div>
          
          <div className="p-3">
            <input type="text" className="form-control bg-dark text-white border-secondary" placeholder="Пошук..." />
          </div>

          <div className="flex-grow-1 overflow-y-auto">
            {/* Тимчасовий фейковий чат для візуалу */}
            <div className="d-flex align-items-center p-3 border-bottom border-secondary" style={{ backgroundColor: '#2d1b4e', cursor: 'pointer' }}>
              <div className="rounded-circle bg-secondary me-3" style={{ width: '40px', height: '40px' }}></div>
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">Анна Петренко</span>
                  <small className="text-muted">10:42</small>
                </div>
                <small className="text-primary">Пише...</small>
              </div>
            </div>
            {/* Сюди потім будуть підтягуватися інші чати з Firebase */}
          </div>
        </div>

        {/* ПРАВА ПАНЕЛЬ: Відкритий діалог */}
        <div className="col-12 col-md-8 col-lg-9 d-flex flex-column p-0 bg-black">
          
          {/* Шапка відкритого чату */}
          <div className="p-3 border-bottom border-secondary d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="rounded-circle bg-secondary me-3" style={{ width: '40px', height: '40px' }}></div>
              <div>
                <h6 className="m-0">Анна Петренко</h6>
                <small className="text-success">Online</small>
              </div>
            </div>
            <div>
              <i className="bi bi-telephone fs-5 me-3"></i>
              <i className="bi bi-camera-video fs-5 me-3"></i>
              <i className="bi bi-info-circle fs-5"></i>
            </div>
          </div>

          {/* Поле для повідомлень */}
          <div className="flex-grow-1 overflow-y-auto p-4">
            {/* Тимчасові повідомлення */}
            <div className="d-flex justify-content-end mb-3">
              <div className="p-3 rounded-3" style={{ backgroundColor: '#8a2be2', color: 'white', maxWidth: '70%' }}>
                Привіт! Можу після 15:00. Тобі підходить?
              </div>
            </div>
            <div className="d-flex justify-content-start mb-3">
              <div className="p-3 rounded-3 bg-dark text-white" style={{ maxWidth: '70%' }}>
                Привіт, о котрій ти сьогодні вільна, щоб обговорити деталі?
              </div>
            </div>
          </div>

          {/* Інпут вводу тексту */}
          <div className="p-3 border-top border-secondary">
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-white"><i className="bi bi-plus-lg"></i></span>
              <input type="text" className="form-control bg-dark border-secondary text-white" placeholder="Напишіть повідомлення..." />
              <button className="btn" style={{ backgroundColor: '#8a2be2', color: 'white' }}><i className="bi bi-send-fill"></i></button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChatLayout;