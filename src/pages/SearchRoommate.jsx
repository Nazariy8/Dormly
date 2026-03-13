import React from "react";
import { useNavigate } from "react-router-dom";
import UserForRoom from "../components/UserForRoom";

// Імпортуємо функцію з правильного файлу (перевір шлях!)
import { handleGoTest } from "../utils/functions.jsx";

// Додаємо users та userAnswers в дужки (це пропси)
const SearchRoommate = ({ user, userAnswers, users }) => {
  const navigate = useNavigate(); // Додаємо navigate, бо handleGoTest його потребує

  return (
    <div>
      {/* {userAnswers ? (
        <div className="w-100 pe-2">
          {users.map((user) => (
            <UserForRoom key={user.id} userAnswers={userAnswers} user={user} />
          ))}
        </div>
      ) : (
        <div className="text-xl-end">
          <h5 className="text-secondary mb-3">
            У вас немає спільних інтересів, так як ви не пройшли тест!
          </h5>
          <button
            className="btn btn-action-primary rounded-pill px-4 py-2"
            // Викликаємо функцію правильно, передаючи navigate
            onClick={() => handleGoTest(navigate)}
          >
            Пройти тест
          </button>
        </div>
      )} */}
    </div>
  );
};

export default SearchRoommate;
