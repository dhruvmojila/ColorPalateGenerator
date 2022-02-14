const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popUp = document.querySelector(".copy-container");
const adjustBtn = document.querySelectorAll(".adjust");
const lockBtn = document.querySelectorAll(".lock");
const closeAdjustmentBtn = document.querySelectorAll(".close-adjustment");
const sliderContainer = document.querySelectorAll(".sliders");
let initialColors;

let savedPalettes = [];

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});
colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});
currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});
popUp.addEventListener("transitionend", () => {
  const popUpBox = popUp.children[0];
  popUp.classList.remove("active");
  popUpBox.classList.remove("active");
});
adjustBtn.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    openAdjustMentPanel(index);
  });
});
closeAdjustmentBtn.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    closeAdjustMentPanel(index);
  });
});
lockBtn.forEach((button, index) => {
  button.addEventListener("click", (e) => {
    lockLayer(e, index);
  });
});
generateBtn.addEventListener("click", randomColors);

function generateHex() {
  //   const latters = "#0123456789ABCDEF";
  //   let hash = "#";
  //   for (let i = 0; i < 6; i++) {
  //     hash += latters[Math.floor(Math.random() * 16)];
  //   }
  //   return hash;

  //chroma js

  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  initialColors = [];

  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor.hex()));
    }

    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    checkTextContrast(randomColor, hexText);

    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSlider(color, hue, brightness, saturation);
  });

  resetInputs();
  adjustBtn.forEach((btn, index) => {
    checkTextContrast(initialColors[index], btn);
    checkTextContrast(initialColors[index], lockBtn[index]);
  });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSlider(color, hue, brightness, saturation) {
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);

  const scaleSat = chroma.scale([noSat, color, fullSat]);

  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )},${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )},${scaleBright(0.5)},${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right,rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(e) {
  const index =
    e.target.getAttribute("data-brightness") ||
    e.target.getAttribute("data-saturation") ||
    e.target.getAttribute("data-hue");
  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  //   console.log(sliders);
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];
  const bgColor = initialColors[index];
  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  colorizeSlider(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex();

  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetInputs() {
  const slider = document.querySelectorAll(".slider input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];

      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-brightness")];
      const brightValue = chroma(brightColor).hsl()[2];

      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-saturation")];
      const satValue = chroma(satColor).hsl()[1];

      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;

  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  const popUpBox = popUp.children[0];
  popUpBox.children[1].innerText = `Hex value ${el.value} is copied!.`;
  popUpBox.classList.add("active");
  popUp.classList.add("active");
}

function openAdjustMentPanel(index) {
  sliderContainer[index].classList.toggle("active");
}
function closeAdjustMentPanel(index) {
  sliderContainer[index].classList.remove("active");
}

function lockLayer(e, index) {
  const lockSVG = e.target.children[0];
  const activeBg = colorDivs[index];
  activeBg.classList.toggle("locked");

  if (lockSVG.classList.contains("fa-lock-open")) {
    e.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}

// let randomHex = generateHex();
// console.log(randomHex);

// implment save to palette and local storage
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-name");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");
const selectPaletteBtn = document.querySelector(".pick-palette-btn");

saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

function openPalette(e) {
  const savePopup = saveContainer.children[0];
  saveContainer.classList.add("active");
  savePopup.classList.add("active");
}
function closePalette(e) {
  const savePopup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  savePopup.classList.remove("active");
}
function savePalette(e) {
  saveContainer.classList.remove("active");
  popUp.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });
  let paletteNr = savedPalettes.length;
  const paletteObject = { name: name, colors: colors, nr: paletteNr };
  savedPalettes.push(paletteObject);
  saveToLocal(paletteObject);
  saveInput.value = "";

  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObject.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObject.colors.forEach((color) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = color;
    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObject.nr);
  paletteBtn.innerText = "Select";

  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInputs();
  });

  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);

  libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(paletteObject) {
  let localPalattes;
  if (localStorage.getItem("palettes") === null) {
    localPalattes = [];
  } else {
    localPalattes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalattes.push(paletteObject);
  localStorage.setItem("palettes", JSON.stringify(localPalattes));
}

function openLibrary() {
  const libraryPopup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  libraryPopup.classList.add("active");
}
function closeLibrary() {
  const libraryPopup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  libraryPopup.classList.remove("active");
}

function getLocal() {
  let paletteObjs;
  if (localStorage.getItem("palettes") === null) {
    paletteObjs = [];
  } else {
    paletteObjs = JSON.parse(localStorage.getItem("palettes"));
    savedPalettes = paletteObjs;
    paletteObjs.forEach((paletteObject) => {
      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObject.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      paletteObject.colors.forEach((color) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = color;
        preview.appendChild(smallDiv);
      });
      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(paletteObject.nr);
      paletteBtn.innerText = "Select";

      paletteBtn.addEventListener("click", (e) => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        // console.log(savedPalettes);
        savedPalettes[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInputs();
      });

      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);

      libraryContainer.children[0].appendChild(palette);
    });
  }
}

getLocal();
randomColors();
