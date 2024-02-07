import { useFormik } from "formik";
import { v4 } from "uuid";
import { db, storage } from "../config/firebase";
import * as Yup from "yup";
import { doc, updateDoc } from "firebase/firestore";
import Footer from "./Footer";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { Tooltip } from "react-tooltip";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const ChangeAvatar = ({ authUser }) => {
  const [clickedButton, setClickedButton] = useState(false);

  const { state } = useLocation();
  const { id, oldImageURL } = state;

  const history = useNavigate();

  const formik = useFormik({
    initialValues: {
      image: null,
    },
    validationSchema: Yup.object({
      image: Yup.mixed()
        .test(
          "fileFormat",
          "Obsługiwane formaty plików to JPG, PNG oraz JPEG",
          (value) => {
            if (!value) return true;

            const supportedFormats = ["image/jpeg", "image/png", "image/jpg"];
            return supportedFormats.includes(value.type);
          },
        )
        .test(
          "fileSize",
          "Maksymalny dopuszcalny rozmiar zdjecia to 5MB",
          (value) => {
            const MAX_PHOTO_SIZE = 5242880;
            return value.size <= MAX_PHOTO_SIZE;
          },
        ),
    }),
    onSubmit: async () => {
      try {
        let imageURL = null;

        const imageRef = ref(
          storage,
          `userImages/${formik.values.image.name + v4()}`,
        );
        const snapshot = await uploadBytes(imageRef, formik.values.image);
        imageURL = await getDownloadURL(snapshot.ref);

        const reff = doc(db, "users", id);
        await updateDoc(reff, {
          imageURL: imageURL,
        });

        if (oldImageURL) {
          if (
            oldImageURL !=
            "https://firebasestorage.googleapis.com/v0/b/fishfind-2e78f.appspot.com/o/userImages%2FDefaultAvatar.png?alt=media&token=ecb71d3a-2b7e-4ac1-b770-9ce0fbf680f6"
          ) {
            const storageRef = ref(storage, oldImageURL);
            await deleteObject(storageRef);
          }
        }

        history("/account");
      } catch (err) {
        console.log(err);
      }
    },
  });

  return (
    <>
      {authUser ? (
        <>
          <div className="sss flex w-full justify-center text-center">
            <div className="w-2/5 self-center">
              <form
                onSubmit={formik.handleSubmit}
                className="mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md">
                <h1 className="border-silver border-b-2 border-solid pb-4">
                  Prześlij nowy avatar
                </h1>
                <div className="my-3">
                  <div className="flex justify-center">
                    <Tooltip id="my-tooltip" className="z-10" />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon icon-tabler icon-tabler-info-circle mr-4 self-center"
                      width={20}
                      height={20}
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      data-tooltip-id="my-tooltip"
                      data-tooltip-content="Obługiwane formaty zdjęć to PNG, JPG oraz JPEG. Maksymalny rozmiar zdjęcia to 5MB">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                      <path d="M12 9h.01" />
                      <path d="M11 12h1v4h1" />
                    </svg>
                    <input
                      type="file"
                      name="image"
                      onChange={(event) =>
                        formik.setFieldValue(
                          "image",
                          event.currentTarget.files[0],
                        )
                      }
                    />
                  </div>
                  {(formik.touched.image || clickedButton) &&
                  formik.errors.image ? (
                    <p className="text-xs italic text-red-500">
                      {formik.errors.image}
                    </p>
                  ) : null}
                </div>
                <div>
                  <button
                    className="focus:shadow-outline mb-6 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                    type="submit"
                    onClick={() => setClickedButton(true)}>
                    Zmień
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      ) : null}
      <Footer />
    </>
  );
};

export default ChangeAvatar;
