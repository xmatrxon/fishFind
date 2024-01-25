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
      className={`popup-background ${
        isVisible ? "visible" : "hidden"
      } text-black`}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          background: "white",
          borderRadius: "8px",
          width: "300px",
          padding: "20px 10px",
          animation: isVisible ? "fadeIn 0.3s linear" : "fadeOut 0.3s linear",
        }}
        className="!bg-white">
        <div
          style={{
            borderBottom: "1px solid lightgray",
            paddingBottom: "10px",
          }}>
          <h1 style={{ margin: 0 }}>Wędkarski kalendarz brań</h1>
          <div
            onClick={handlePopupClick}
            style={{
              cursor: "pointer",
              position: "absolute",
              top: 10,
              right: 10,
            }}>
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
            <br></br>
            <br></br>
            Pierwszym z nich jest średnia dzienna temperatura. Ryby lubią
            żerować w temperaturze pomiędzy 5&#176;C a 25&#176;C.
            <br></br>
            <br></br>
            Kolejnym czynnikiem jest różnica ciśnienia w dany dzień. Ryby nie są
            zbyt aktywne jeżeli ta różnica jest wysoka.
            <br></br>
            <br></br>
            Następnym czynnikiem jest deszcz. W naszym kalendarzu używamy
            prawdopodobieństwa opadów. Jeżeli jest ono wysokie brania zyskują na
            wartości.
            <br></br>
            <br></br>
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
