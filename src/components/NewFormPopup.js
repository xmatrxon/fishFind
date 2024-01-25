import { useState } from "react";
import Select from "react-select";
import { db } from "../config/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useFormik } from "formik";
import { voivodeshipList } from "../voivodeshipList";
import { fishList } from "../fishList";
import * as Yup from "yup";
import { Tooltip } from "react-tooltip";

import "../index.css";

const NewFormPopup = (props) => {
  const [voivodeship, setVoivodeship] = useState("");
  const [fish, setFish] = useState("");
  const [isVisible, setIsVisible] = useState(true);

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
      rules: Yup.string()
        .required("Regulamin łowiska jest wymagany")
        .max(300, "Maksymalna ilość znaków to 300"),
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
          waterId: props.clickedWaterId,
          UID: props.uid,
        }).then(() => {
          handlePopupClick();
          props.pass(true);
          formik.resetForm();
          setFish("");
          setVoivodeship("");
        });
      } catch (err) {
        console.log(err);
      }
    },
  });

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

  const handlePopupClick = () => {
    setIsVisible(false);
    setTimeout(() => {
      props.setTrigger(false);
    }, 300);
  };

  return props.trigger ? (
    <>
      <div
        onClick={handlePopupClick}
        className={`popup-background ${isVisible ? "visible" : "hidden"}`}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            background: "white",
            borderRadius: "8px",
            width: "600px",
            padding: "20px 10px",
            animation: isVisible ? "fadeIn 0.3s linear" : "fadeOut 0.3s linear",
          }}
          className="!bg-white">
          <div
            style={{
              borderBottom: "1px solid lightgray",
              paddingBottom: "10px",
            }}>
            <h1 className="text-xl">Dodaj łowisko</h1>
            <div
              onClick={handlePopupClick}
              style={{
                cursor: "pointer",
                position: "absolute",
                top: 10,
                right: 10,
              }}>
              <button
                className="focus:shadow-outline t-0 mb-5 flex rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
                type="button">
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
              </button>
            </div>
          </div>
          <div>
            {" "}
            <form
              onSubmit={formik.handleSubmit}
              className="mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md">
              <div className="flex justify-between">
                <p></p>
              </div>
              <div className="mb-4">
                <input
                  className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                  id="name"
                  type="text"
                  placeholder="Nazwa łowiska"
                  name="name"
                  onChange={(e) =>
                    formik.handleChange({
                      target: {
                        name: "name",
                        value:
                          e.target.value.charAt(0).toUpperCase() +
                          e.target.value.slice(1),
                      },
                    })
                  }
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
              <div className="mb-4 ">
                <div className="flex">
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
                  <Tooltip id="my-tooltip" className="z-10" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-info-circle self-center"
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content='Jeżeli obowiązuje regulamin PZW wpisz "Regulamin PZW"'>
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                    <path d="M12 9h.01" />
                    <path d="M11 12h1v4h1" />
                  </svg>
                </div>
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
                {(formik.touched.fish || clickedButton) &&
                formik.errors.fish ? (
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
      </div>
    </>
  ) : null;
};

export default NewFormPopup;
