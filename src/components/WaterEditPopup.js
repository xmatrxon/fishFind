import { useState } from "react";
import Select from "react-select";
import { db } from "../config/firebase";
import { updateDoc, doc } from "firebase/firestore";
import { useFormik } from "formik";
import { fishList } from "../fishList";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";

const WaterEditPopup = (props) => {
  const [fish, setFish] = useState("");
  const [clickedButton, setClickedButton] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const history = useNavigate();

  const isVisible = true;

  const formik = useFormik({
    initialValues: {
      description: "",
      rules: "",
    },
    validationSchema: Yup.object({
      description: Yup.string().max(1000, "Maksymalna ilość znaków to 1000"),
      rules: Yup.string().max(300, "Maksymalna ilość znaków to 300"),
    }),
    onSubmit: async () => {
      const markersCollectionRef = doc(db, "markers", props.waterId);

      try {
        const updateData = {};

        if (formik.values.description.trim() !== "") {
          updateData.description = formik.values.description.trim();
        }

        if (formik.values.rules.trim() !== "") {
          updateData.rules = formik.values.rules.trim();
        }

        if (Object.keys(fish).length > 0) {
          updateData.fish = fish;
        }

        if (Object.keys(updateData).length > 0) {
          await updateDoc(markersCollectionRef, updateData).then(() => {
            props.pass(true);
            formik.resetForm();
            setFish("");
            history(0);
          });
        } else {
          setErrorMessage("Wszystkie pola są puste");
        }
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

  const handlePopupClick = () => {
    props.setTrigger(false);
    setFish("");
    formik.setFieldValue("description", "");
    formik.setFieldValue("rules", "");
  };

  return props.trigger ? (
    <>
      <div
        onClick={handlePopupClick}
        className={`popup-water popup-background ${
          isVisible ? "visible" : "hidden"
        }`}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: isVisible ? "fadeIn 0.3s linear" : "fadeOut 0.3s linear",
          }}
          className="content">
          <div className="header-div">
            <h1>Edytuj łowisko</h1>
            <div onClick={handlePopupClick} className="button-div">
              <button
                aria-label="Close popup"
                className="focus:shadow-outline t-0 mb-5 flex rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
                type="button"
                onClick={() => props.setTrigger(false)}>
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
          <div className="form-div">
            <form onSubmit={formik.handleSubmit} className="shadow-md">
              <div className="input-div">
                <input
                  aria-label="Description"
                  className="focus:shadow-outline w-full appearance-none rounded border leading-tight text-gray-700 shadow focus:outline-none"
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
              <div className="input-div">
                <div className="flex">
                  <textarea
                    className="focus:shadow-outline max-h-40 w-full appearance-none rounded border leading-tight text-gray-700 shadow focus:outline-none"
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
              <div className="input-div">
                <Select
                  aria-label="Fish"
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
              <div className="button-div">
                <button
                  aria-label="Edit"
                  className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                  type="submit"
                  onClick={() => setClickedButton(true)}>
                  Edytuj
                </button>
              </div>
              <div>
                {errorMessage ? (
                  <div
                    className="error-div bg-red-100text-red-700 relative rounded border border-red-400"
                    role="alert">
                    <span className="block text-red-500 sm:inline">
                      {errorMessage}
                    </span>
                    <span className="error-span absolute bottom-0 right-0 top-0">
                      <svg
                        className="h-6 w-6 fill-current text-red-500"
                        role="button"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        onClick={() => setErrorMessage("")}>
                        <title>Zamknij</title>
                        <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                      </svg>
                    </span>
                  </div>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  ) : null;
};
export default WaterEditPopup;
