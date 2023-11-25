import { useState } from "react";
import Select from "react-select";
import { db } from "../config/firebase";
import { collection, addDoc } from "firebase/firestore";
import CloseIcon from "@mui/icons-material/Close";
import { useFormik } from "formik";
import * as Yup from "yup";

const FormPopup = (props) => {
  const [voivodeship, setVoivodeship] = useState("");
  const [fish, setFish] = useState("");

  const [clickedButton, setClickedButton] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      rules: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .max(30, "Maksymalna ilość znaków to 30")
        .required("Nazwa łowiska jest wymagana"),
      description: Yup.string()
        .required("Opis łowiska jest wymagany")
        .max(300, "Maksymalna ilość znaków to 300"),
      rules: Yup.string().max(300, "Maksymalna ilość znaków to 300"),
      voivodeship: Yup.string().required("Województwo jest wymagane"),
      fish: Yup.array().required("Conajmniej jeden gatunek jest wymagany"),
    }),
    onSubmit: async () => {
      const markersCollectionRef = collection(db, "markers");

      try {
        await addDoc(markersCollectionRef, {
          id: Date.now(),
          name: formik.values.name,
          voivodeship: voivodeship,
          description: formik.values.description,
          rules: formik.values.rules,
          fish: fish,
          lon: props.lng,
          lat: props.lat,
        });
      } catch (err) {
        console.log(err);
      }
    },
  });

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
    const selectedFishValues = data.map((fishOption) => fishOption.value);
    formik.setFieldValue("fish", selectedFishValues);
    formik.setFieldTouched("fish", true);
  };

  const handleVoivodeship = (data) => {
    setVoivodeship(data);
    formik.setFieldValue("voivodeship", data.value);
    formik.setFieldTouched("voivodeship", true);
  };

  return props.trigger ? (
    <div className="align-center z-100 fixed flex h-screen w-screen justify-center">
      <div className="t-1/2 l-1/2 absolute w-1/2 p-32">
        <form
          onSubmit={formik.handleSubmit}
          className="mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md">
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
              name="name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
            />
            {formik.touched.name && formik.errors.name ? (
              <p className="text-xs italic text-red-500">
                {formik.errors.name}
              </p>
            ) : null}
          </div>
          <div className="mb-4">
            <input
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
              id="description"
              type="text"
              placeholder="Opis łowiska"
              name="description"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
            />
            {formik.touched.description && formik.errors.description ? (
              <p className="text-xs italic text-red-500">
                {formik.errors.description}
              </p>
            ) : null}
          </div>
          <div className="mb-4">
            <textarea
              className="focus:shadow-outline max-h-40 w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
              id="rules"
              type="text"
              placeholder="Regulamin łowiska"
              rows="2"
              name="rules"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.rules}
            />
            {formik.touched.rules && formik.errors.rules ? (
              <p className="text-xs italic text-red-500">
                {formik.errors.rules}
              </p>
            ) : null}
          </div>
          <div className="mb-4">
            <Select
              className=""
              options={voivodeshipList}
              placeholder="Województwo"
              value={voivodeship}
              onChange={handleVoivodeship}
              onBlur={formik.handleBlur}
              isMulti={false}
            />
            {(formik.touched.voivodeship || clickedButton) &&
            formik.errors.voivodeship ? (
              <p className="text-xs italic text-red-500">
                {formik.errors.voivodeship}
              </p>
            ) : null}
          </div>
          <div className="mb-4">
            <Select
              className=""
              options={fishList}
              placeholder="Występujące ryby"
              value={fish}
              onChange={handleFish}
              onBlur={formik.handleBlur}
              isMulti
            />
            {(formik.touched.fish || clickedButton) && formik.errors.fish ? (
              <p className="text-xs italic text-red-500">
                {formik.errors.fish}
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-between">
            <button
              className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
              type="submit"
              onClick={() => setClickedButton(true)}>
              Dodaj
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default FormPopup;
