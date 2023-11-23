import { useState } from "react";
import Select from "react-select";
import { db } from "../config/firebase";
import { collection, addDoc } from "firebase/firestore";
import CloseIcon from "@mui/icons-material/Close";

const FormPopup = (props) => {
  const [name, setName] = useState("");
  const [voivodeship, setVoivodeship] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [fish, setFish] = useState("");

  const fishList = [
    { value: "amur", label: "Amur" },
    { value: "bolen", label: "Boleń" },
    { value: "jaz", label: "Jaź" },
    { value: "karas", label: "Karaś" },
    { value: "karp", label: "Karp" },
    { value: "kielb", label: "Kiełb" },
    { value: "klen", label: "Kleń" },
    { value: "krap", label: "Krąp" },
    { value: "leszcz", label: "Leszcz" },
    { value: "lin", label: "Lin" },
    { value: "lipien", label: "Lipień" },
    { value: "mietus", label: "Miętus" },
    { value: "okon", label: "Okoń" },
    { value: "pstragPotokowy", label: "Pstrąg potokowy" },
    { value: "pstragTeczowy", label: "Pstrąg tęczowy" },
    { value: "ploc", label: "Płoć" },
    { value: "sandacz", label: "Sandacz" },
    { value: "sum", label: "Sum" },
    { value: "szczupak", label: "Szczupak" },
    { value: "trocJeziorowa", label: "Troć jeziorowa" },
    { value: "ukleja", label: "Ukleja" },
    { value: "wzdrega", label: "Wzdręga" },
    { value: "wegorz", label: "Węgorz" },
    { value: "inne", label: "Inne" },
  ];

  const voivodeshipList = [
    { value: "dolnoslaskie", label: "Dolnośląskie" },
    { value: "kujawskoPomorskie", label: "Kujawsko-Pomorskie" },
    { value: "lubelskie", label: "Lubelskie" },
    { value: "lubuskie", label: "Lubuskie" },
    { value: "lodzkie", label: "Łódzkie" },
    { value: "malopolskie", label: "Małopolskie" },
    { value: "mazowieckie", label: "Mazowieckie" },
    { value: "opolskie", label: "Opolskie" },
    { value: "podkarpackie", label: "Podkarpackie" },
    { value: "podlaskie", label: "Podlaskie" },
    { value: "pomorskie", label: "Pomorskie" },
    { value: "slaskie", label: "Śląskie" },
    { value: "swietokrzyskie", label: "Świętokrzyskie" },
    { value: "warminskoMazurskie", label: "Warmińsko-Mazurskie" },
    { value: "wielkopolskie", label: "Wielkopolskie" },
    { value: "zachodniopomorskie", label: "Zachodniopomorskie" },
  ];

  const handleFish = (data) => {
    setFish(data);
  };

  const handleVoivodeship = (data) => {
    setVoivodeship(data);
  };

  const clickHander = () => {
    const markersCollectionRef = collection(db, "markers");
    try {
      addDoc(markersCollectionRef, {
        id: Date.now(),
        name: name,
        voivodeship: voivodeship,
        description: description,
        rules: rules,
        fish: fish,
        lon: props.lng,
        lat: props.lat,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return props.trigger ? (
    <div className="align-center z-100 fixed flex h-screen w-screen justify-center">
      <div className="t-1/2 l-1/2 absolute w-1/2 p-32">
        <form className="mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md">
          <div className="flex justify-between">
            <p></p>
            <h1 className="text-xl">Dodaj łowisko</h1>
            <button
              className="focus:shadow-outline t-0 mb-5 flex rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
              type="button"
              onClick={() => props.setTrigger(false)}>
              <CloseIcon />
            </button>
          </div>
          <div className="mb-4">
            <input
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
              id="name"
              type="text"
              placeholder="Nazwa łowiska"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <input
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
              id="description"
              type="text"
              placeholder="Opis łowiska"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <textarea
              className="focus:shadow-outline max-h-40 w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
              id="rules"
              type="text"
              placeholder="Regulamin łowiska"
              rows="2"
              onChange={(e) => setRules(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <Select
              className=""
              options={voivodeshipList}
              placeholder="Województwo"
              value={voivodeship}
              onChange={handleVoivodeship}
              isMulti={false}
            />
          </div>
          <div className="mb-4">
            <Select
              className=""
              options={fishList}
              placeholder="Występujące ryby"
              value={fish}
              onChange={handleFish}
              isMulti
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
              type="button"
              onClick={clickHander}>
              Dodaj
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default FormPopup;
