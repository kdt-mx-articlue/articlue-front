const POSTCODE_SCRIPT_ID = "daum-postcode-script";
const POSTCODE_SCRIPT_URL =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

export const loadPostcodeScript = () => {
  return new Promise((resolve, reject) => {
    if (window.daum?.Postcode) {
      resolve(window.daum.Postcode);
      return;
    }

    const existingScript = document.getElementById(POSTCODE_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.daum?.Postcode) resolve(window.daum.Postcode);
      });
      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.id = POSTCODE_SCRIPT_ID;
    script.src = POSTCODE_SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      if (window.daum?.Postcode) {
        resolve(window.daum.Postcode);
      } else {
        reject(new Error("주소 검색 서비스를 불러오지 못했습니다."));
      }
    };

    script.onerror = () => {
      reject(new Error("주소 검색 스크립트 로딩에 실패했습니다."));
    };

    document.body.appendChild(script);
  });
};

export const openAddressSearch = async (callback) => {
  try {
    const Postcode = await loadPostcodeScript();

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.inset = "0";
    wrapper.style.zIndex = "9999";
    wrapper.style.background = "rgba(15, 23, 42, 0.45)";
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.justifyContent = "center";

    const box = document.createElement("div");
    box.style.width = "420px";
    box.style.height = "520px";
    box.style.background = "#fff";
    box.style.borderRadius = "20px";
    box.style.overflow = "hidden";
    box.style.boxShadow = "0 20px 50px rgba(15,23,42,0.25)";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "닫기";
    closeButton.style.width = "100%";
    closeButton.style.height = "44px";
    closeButton.style.border = "0";
    closeButton.style.background = "#0f172a";
    closeButton.style.color = "#fff";
    closeButton.style.fontWeight = "800";
    closeButton.style.cursor = "pointer";

    const searchArea = document.createElement("div");
    searchArea.style.width = "100%";
    searchArea.style.height = "476px";

    closeButton.onclick = () => {
      document.body.removeChild(wrapper);
    };

    box.appendChild(closeButton);
    box.appendChild(searchArea);
    wrapper.appendChild(box);
    document.body.appendChild(wrapper);

    new Postcode({
      oncomplete: (data) => {
        callback({
          zonecode: data.zonecode,
          address: data.roadAddress || data.jibunAddress,
        });

        document.body.removeChild(wrapper);
      },
      width: "100%",
      height: "100%",
    }).embed(searchArea);
  } catch (error) {
    console.error(error);
    alert("주소 검색 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
};