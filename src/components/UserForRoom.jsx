// UserForRoom.jsx

import { useState } from "react";

// ФУНКЦІЯ: Порівнює текст відповідей за ID питання, ІГНОРУЄ ID 1 та 6.
const calculateSimilarity = (userAnswers, user) => {
  const currentUserAnswers = userAnswers || {};
  const roommateAnswers = user.answers || {};

  // Отримуємо всі ID питань (ключі), які є у сусіда
  const questionIds = Object.keys(roommateAnswers);

  let matches = 0;
  let totalQuestionsToCompare = 0; // Лічильник для питань, які ми реально порівнюємо

  for (const qId of questionIds) {
    // ID питань 1 та 6 є текстовими і мають бути проігноровані
    if (qId === "1" || qId === "6") {
      continue; // Пропускаємо це питання
    }

    const userAnsText = currentUserAnswers[qId];
    const roomieAnsText = roommateAnswers[qId];

    // Порівнюємо лише ті питання, на які відповів користувач
    if (
      userAnsText !== undefined &&
      userAnsText !== null &&
      userAnsText.trim() !== ""
    ) {
      totalQuestionsToCompare++;

      // Порівняння ТЕКСТУ: "Все має бути розділене..." === "Все має бути розділене..."
      if (userAnsText === roomieAnsText) {
        matches++;
      }
    }
  }

  if (totalQuestionsToCompare === 0) {
    return 0;
  }

  const similarityPercentage = (matches / totalQuestionsToCompare) * 100;
  return Math.round(similarityPercentage);
};

// Головний компонент
const UserForRoom = ({ userAnswers, user }) => {
  const similarity = calculateSimilarity(userAnswers, user);
  const widthStyle = `${similarity}%`;
  const [friendRequest, setFriendRequest] = useState(false);
  const addFriendChange = () => {
    setFriendRequest(!friendRequest);
  };
  return (
    <div>
      {
        <div className="roommate-card p-3 ">
          <div className="user-block d-flex align-items-center justify-content-between flex-shrink-0 gap-2">
            <div className="user-photo-block">
              <img src={user.avatar} alt="" className="user-photo" />
            </div>
            <div className="user-info_block text-end">
              <h5 className="user-name">{user.name}</h5>
              <p className="bio">{user.bio}</p>
              <div className="similarity w-100">
                <div className="sim-bar">
                  <div
                    className="progress"
                    role="progressbar"
                    aria-label="Success example"
                    aria-valuenow={similarity}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div
                      className="progress-bar text-bg-success"
                      style={{ width: widthStyle }}
                    >
                      {similarity}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="buttons-for-mate">
            <div className="friend-button">
              {
                friendRequest ? (

              <button
                onClick={addFriendChange}
                className="add-friend activated d-flex align-items-center gap-2"
              >
                Додано <i class="bi bi-check2-circle fs-6"></i>
              </button>

                ) : (
                   <button
                onClick={addFriendChange}
                className="add-friend d-flex align-items-center gap-2"
              >
                Запросити в друзі <i className="bi bi-person-add fs-6"></i>
              </button>
                

                )
              }
             
            </div>
          </div>
        </div>
      }
    </div>
  );
};

export default UserForRoom;
