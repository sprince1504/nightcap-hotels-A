import { createOptimizedPicture } from "../../scripts/aem.js";
import { moveInstrumentation } from "../../scripts/scripts.js";

class Carousel {
  constructor(block) {
    this.currentSlide = 0;
    this.block = block;
    this.init();
  }

  init() {
    this.createCarouselStructure();
    this.createSlides();
    this.setupControls();
    this.setupEventListeners();
    this.optimizeImages();
    this.currentSlide = 1;
    this.updateSlides();
  }

  createCarouselStructure() {
    this.carouselWrapper = document.createElement("div");
    this.carouselWrapper.setAttribute("role", "region");
    this.carouselWrapper.setAttribute("aria-label", "Feature carousel");
    this.carouselWrapper.className =
      "relative w-full overflow-hidden px-[28px] h-[40rem]";

    this.slideTrack = document.createElement("div");
    this.slideTrack.className =
      "flex gap-6 transition-transform duration-500 ease-in-out h-full";
    this.slideTrack.style.width = "100%";
  }

  createSlides() {
    this.slides = [...this.block.children].map((row, index) => {
      const slide = document.createElement("div");
      slide.className =
        "flex-shrink-0 relative rounded-[32px] overflow-hidden transform transition-all duration-500";
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", `Slide ${index + 1}`);

      // Add gradient overlay
      const overlay = document.createElement("div");
      overlay.className =
        "absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10";

      // Create label tag
      const label = document.createElement("div");
      label.className =
        "absolute top-6 left-6 z-20 bg-[#F8D5C5] text-black text-sm px-4 py-2 rounded-full flex items-center gap-2";
      label.innerHTML = `
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none">
          <path d="M9 5L16 12L9 19" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>LABEL</span>
      `;

      // Process the nested structure
      const [imageDiv, contentDiv] = [...row.children];

      // Handle image
      if (imageDiv && imageDiv.querySelector("picture")) {
        const picture = imageDiv.querySelector("picture");
        picture.className = "w-full h-full";
        const img = picture.querySelector("img");
        if (img) {
          img.className = "w-full h-full object-cover";
        }
        slide.appendChild(picture);
      } else {
        // Create default image placeholder
        const defaultImage = document.createElement("div");
        defaultImage.className = "w-full h-full bg-gray-200";
        slide.appendChild(defaultImage);
      }

      // Handle content
      if (contentDiv) {
        const contentWrapper = document.createElement("div");
        contentWrapper.className =
          "absolute bottom-0 left-0 right-0 p-8 z-20 text-white";

        const titleStrong = contentDiv.querySelector("p strong");
        const description = contentDiv.querySelectorAll("p")[1];

        if (titleStrong) {
          const title = document.createElement("h3");
          title.className = "text-5xl font-bold mb-3";
          title.textContent = titleStrong.textContent || "Brisbane, QLD";
          contentWrapper.appendChild(title);
        }

        if (description) {
          const desc = document.createElement("p");
          desc.className = "text-lg text-white/80 mb-4";
          desc.textContent = description.textContent || "Subheading";
          contentWrapper.appendChild(desc);
        }

        // Add "Book a Hotel" link
        const link = document.createElement("a");
        link.href = "#";
        link.className =
          "inline-block text-white text-lg underline hover:no-underline mt-4";
        link.textContent = "Book a Hotel in QLD";
        contentWrapper.appendChild(link);

        slide.appendChild(contentWrapper);
      }

      slide.appendChild(overlay);
      slide.appendChild(label);
      return slide;
    });

    this.slides.forEach((slide) => this.slideTrack.append(slide));
    this.updateSlidesDimensions();
  }

  createDefaultSlide() {
    const slide = document.createElement("div");
    slide.className =
      "w-full md:w-[400px] flex-shrink-0 relative rounded-lg overflow-hidden";

    const defaultImage = document.createElement("div");
    defaultImage.className = "w-full aspect-video bg-gray-200";

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "p-4 bg-white";
    contentWrapper.innerHTML = `
      <h3 class="text-xl font-bold mb-2">Default Title</h3>
      <p class="text-gray-600 text-sm">Default description text</p>
    `;

    slide.append(defaultImage, contentWrapper);
    return slide;
  }

  setupControls() {
    // Previous button
    this.prevButton = document.createElement("button");
    this.prevButton.className =
      "absolute left-0 top-1/2 -translate-y-1/2 z-30 w-[56px] h-[56px] flex items-center justify-center bg-[#F5F5F0] rounded-full border-2 border-black hover:bg-[#EAEAE5] transition-colors";
    this.prevButton.setAttribute("aria-label", "Previous slide");
    this.prevButton.setAttribute("tabindex", "0");
    this.prevButton.innerHTML = `
      <div class="flex items-center justify-center w-full h-full">
        <svg class="w-9 h-9 -ml-0.5 absolute" viewBox="0 0 24 24" fill="none">
          <path d="M15 19l-7-7 7-7" stroke="black" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>`;

    // Next button
    this.nextButton = document.createElement("button");
    this.nextButton.className =
      "absolute right-0 top-1/2 -translate-y-1/2 z-30 w-[56px] h-[56px] flex items-center justify-center bg-[#F5F5F0] rounded-full border-2 border-black hover:bg-[#EAEAE5] transition-colors";
    this.nextButton.setAttribute("aria-label", "Next slide");
    this.nextButton.setAttribute("tabindex", "0");
    this.nextButton.innerHTML = `
      <div class="flex items-center justify-center w-full h-full">
        <svg class="w-9 h-9 -mr-0.5 absolute" viewBox="0 0 24 24" fill="none">
          <path d="M9 5l7 7-7 7" stroke="black" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>`;

    this.carouselWrapper.append(this.prevButton, this.nextButton);
  }

  setupEventListeners() {
    this.prevButton.addEventListener("click", () => {
      this.previousSlide();
      this.prevButton.focus();
    });
    this.nextButton.addEventListener("click", () => {
      this.nextSlide();
      this.nextButton.focus();
    });
    this.carouselWrapper.addEventListener("keydown", (e) =>
      this.handleKeydown(e)
    );
  }

  previousSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    } else {
      // Loop to the end
      this.currentSlide = this.slides.length - 1;
    }
    this.updateSlides();
  }

  nextSlide() {
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
    } else {
      // Loop to the beginning
      this.currentSlide = 0;
    }
    this.updateSlides();
  }

  handleKeydown(e) {
    if (e.key === "ArrowLeft") {
      this.previousSlide();
      this.prevButton.focus();
    } else if (e.key === "ArrowRight") {
      this.nextSlide();
      this.nextButton.focus();
    }
  }

  updateSlides() {
    // Calculate the transform offset considering the gap
    const gapPixels = 24;
    const containerWidth = this.carouselWrapper.offsetWidth;
    const gapPercentage = (gapPixels / containerWidth) * 100;

    // Calculate widths
    const smallSlideWidth = 15 * 16; // 15rem in pixels
    const largeSlideWidth = 35 * 16; // 35rem in pixels

    // Calculate the offset to center the current slide in the middle position
    const smallSlideWidthPercentage = (smallSlideWidth / containerWidth) * 100;
    const initialOffset = smallSlideWidthPercentage + gapPercentage; // Space for first small slide
    const slideOffset = -(
      this.currentSlide *
      (smallSlideWidthPercentage + gapPercentage)
    );
    const totalOffset = slideOffset + initialOffset;

    this.slideTrack.style.transform = `translateX(${totalOffset}%)`;

    // Update visibility and accessibility
    this.slides.forEach((slide, index) => {
      const isVisible = Math.abs(index - this.currentSlide) <= 1;
      slide.setAttribute("aria-hidden", !isVisible);
      slide.setAttribute("tabindex", isVisible ? "0" : "-1");
    });

    // Update button states and visibility
    const isFirstSlide = this.currentSlide === 0;
    const isLastSlide = this.currentSlide === this.slides.length - 1;

    // Only hide controls at the very beginning or end
    this.prevButton.style.display = isFirstSlide ? "none" : "flex";
    this.nextButton.style.display = isLastSlide ? "none" : "flex";

    this.updateSlidesDimensions();
  }

  updateSlidesDimensions() {
    this.slides.forEach((slide, index) => {
      const distance = Math.abs(index - this.currentSlide);

      if (distance === 0) {
        // Current slide (will appear in middle)
        slide.style.width = "35rem";
        slide.style.height = "40rem";
        slide.style.opacity = "1";
      } else if (distance === 1) {
        // Adjacent slides
        slide.style.width = "15rem";
        slide.style.height = "35rem";
        slide.style.opacity = "1";
      } else {
        // Hidden slides
        slide.style.width = "15rem";
        slide.style.height = "35rem";
        slide.style.opacity = "0";
      }
    });
  }

  optimizeImages() {
    this.slideTrack.querySelectorAll("picture > img").forEach((img) => {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [
        { width: "750" },
      ]);
      moveInstrumentation(img, optimizedPic.querySelector("img"));
      img.closest("picture").replaceWith(optimizedPic);
    });
  }

  render() {
    this.carouselWrapper.append(this.slideTrack);
    this.block.textContent = "";
    this.block.append(this.carouselWrapper);
  }
}

export default function decorate(block) {
  const carousel = new Carousel(block);
  carousel.render();
}
