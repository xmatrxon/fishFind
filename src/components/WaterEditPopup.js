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
  const history = useNavigate();

  const formik = useFormik({
    initialValues: {
      description: "",
      rules: "",
    },
    validationSchema: Yup.object({
      description: Yup.string().max(300, "Maksymalna ilość znaków to 300"),
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
          alert("Wszystkie pola są puste");
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
          <div className="mb-4 flex">
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
            <Tooltip id="my-tooltip" />

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

            {formik.touched.rules && formik.errors.rules ? (
              <p className="text-xs italic text-red-500">
                {formik.errors.rules}
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
              Edytuj
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};
export default WaterEditPopup;
