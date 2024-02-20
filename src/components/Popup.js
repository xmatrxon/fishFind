import { useState } from "react";

const Popup = ({ setIsOpenPopup }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handlePopupClick = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsOpenPopup(false);
    }, 300);
  };

  return (
    <div
      onClick={handlePopupClick}
      className={`popup-water popup-background z-10 ${
        isVisible ? "visible" : "hidden"
      } text-black`}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: isVisible ? "fadeIn 0.3s linear" : "fadeOut 0.3s linear",
        }}
        className="content">
        <div className="header-div">
          <h1>Wędkarski kalendarz brań</h1>
          <div onClick={handlePopupClick} className="button-div">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon icon-tabler icon-tabler-x"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M18 6l-12 12" />
              <path d="M6 6l12 12" />
            </svg>
          </div>
        </div>
        <div>
          <p>
            Nasz algorytm tworzący kalendarz brań, bierze pod uwagę cztery
            najważniejsze czynniki przy wędkowaniu. Następnie przypisuje
            odpowiednim czynnikom wagę oraz oblicza punkty, które zostaly
            wygenerowane na podstawie określonych czynników.
          </p>
          <p>
            Pierwszym z nich jest średnia dzienna temperatura. Ryby lubią
            żerować w temperaturze pomiędzy 5&#176;C a 25&#176;C.
          </p>
          <p>
            Kolejnym czynnikiem jest różnica ciśnienia w dany dzień. Ryby nie są
            zbyt aktywne jeżeli ta różnica jest wysoka.
          </p>
          <p>
            {" "}
            Następnym czynnikiem jest deszcz. W naszym kalendarzu używamy
            prawdopodobieństwa opadów. Jeżeli jest ono wysokie brania zyskują na
            wartości.
          </p>
          <p>
            {" "}
            Ostatnim z czynników są fazy księżyca. W zależności od fazy, która
            będzie danej nocy, ryby następnego dnia różnie żerują. Najlepsze
            brania są podczas księżyca w nowiu.
          </p>
        </div>
      </div>
    </div>
  );
};
export default Popup;
