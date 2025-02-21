import { createOptimizedPicture } from "../../scripts/aem.js";
import { moveInstrumentation } from "../../scripts/scripts.js";

class OffersCarousel {
  constructor(block) {
    this.currentSlide = 0;
    this.block = block;
    this.init();
  }

  init() {
    // Extract and create header from first two divs
    const headerTitle =
      this.block.children[0]?.querySelector("p")?.textContent ||
      "Deals & Offers";
    const headerSubtitle =
      this.block.children[1]?.querySelector("p")?.textContent ||
      "Check out our latest offers";

    // Create header section
    const header = document.createElement("div");
    header.className = "mb-8";
    header.innerHTML = `
      <h2 class="text-4xl font-bold mb-2">${headerTitle}</h2>
      <p class="text-lg text-gray-600">${headerSubtitle}</p>
    `;

    // Remove header divs from block
    if (this.block.children[0]) this.block.removeChild(this.block.children[0]);
    if (this.block.children[0]) this.block.removeChild(this.block.children[0]);

    this.createCarouselStructure();
    this.createSlides();
    this.setupControls();
    this.setupPagination();
    this.setupEventListeners();
    this.optimizeImages();
    this.currentSlide = 1;
    this.updateSlides();

    // Clear the block's content
    this.block.textContent = "";

    // Add header and main container to block
    this.block.appendChild(header);
    this.block.appendChild(this.mainContainer);
  }

  createCarouselStructure() {
    // Create main container to hold both carousel and pagination
    this.mainContainer = document.createElement("div");
    this.mainContainer.className = "flex flex-col items-center gap-8";

    // Carousel wrapper
    this.carouselWrapper = document.createElement("div");
    this.carouselWrapper.setAttribute("role", "region");
    this.carouselWrapper.setAttribute("aria-label", "Offers carousel");
    this.carouselWrapper.className =
      "relative w-full overflow-hidden px-[28px] h-[40rem]";

    this.slideTrack = document.createElement("div");
    this.slideTrack.className =
      "flex gap-6 transition-transform duration-500 ease-in-out h-full";
    this.slideTrack.style.width = "100%";

    // Pagination container - now outside of carousel wrapper
    this.paginationContainer = document.createElement("div");
    this.paginationContainer.className =
      "flex justify-center items-center gap-2 mt-8";
  }

  createSlides() {
    this.slides = [...this.block.children].map((offerDiv) => {
      const slide = document.createElement("div");
      slide.className =
        "flex-shrink-0 relative rounded-[32px] overflow-hidden transform transition-all duration-500";
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");

      // Add gradient overlay
      const overlay = document.createElement("div");
      overlay.className =
        "absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10";

      // Create offer tag
      const offerTag = document.createElement("div");
      offerTag.className =
        "absolute top-6 left-6 z-20 bg-[#F8D5C5] text-black text-sm px-4 py-2 rounded-full flex items-center gap-2";
      offerTag.innerHTML = `
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none">
          <path d="M9 5L16 12L9 19" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>${
          offerDiv.children[1]?.querySelector("p")?.textContent || "OFFER"
        }</span>
      `;

      // Handle image - first div contains picture
      const pictureElement = offerDiv.children[0]?.querySelector("picture");
      if (pictureElement) {
        const picture = pictureElement.cloneNode(true);
        picture.className = "w-full h-full";
        const img = picture.querySelector("img");
        if (img) {
          img.className = "w-full h-full object-cover";
        }
        slide.appendChild(picture);
      }

      // Create content wrapper
      const contentWrapper = document.createElement("div");
      contentWrapper.className =
        "absolute bottom-0 left-0 right-0 p-8 z-20 text-white";

      // Add location - third div contains location
      const location = document.createElement("h3");
      location.className = "text-5xl font-bold mb-3";
      location.textContent =
        offerDiv.children[2]?.querySelector("p")?.textContent || "Location";
      contentWrapper.appendChild(location);

      // Add description - fourth div contains description
      const description = document.createElement("p");
      description.className = "text-lg text-white/80 mb-4";
      description.textContent =
        offerDiv.children[3]?.querySelector("p")?.textContent || "Description";
      contentWrapper.appendChild(description);

      // Add "View Offer" link
      const link = document.createElement("a");
      link.href = "#";
      link.className =
        "inline-block text-white text-lg underline hover:no-underline mt-4";
      link.textContent = "View Offer";
      contentWrapper.appendChild(link);

      slide.appendChild(overlay);
      slide.appendChild(offerTag);
      slide.appendChild(contentWrapper);
      return slide;
    });

    this.slides.forEach((slide) => this.slideTrack.append(slide));
    this.updateSlidesDimensions();
  }

  setupControls() {
    // Previous button
    this.prevButton = document.createElement("button");
    this.prevButton.className =
      "absolute left-0 top-1/2 -translate-y-1/2 z-30 w-[56px] h-[56px] flex items-center justify-center bg-[#F5F5F0] rounded-full border-2 border-black hover:bg-[#EAEAE5] transition-colors";
    this.prevButton.setAttribute("aria-label", "Previous slide");
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
    this.nextButton.innerHTML = `
      <div class="flex items-center justify-center w-full h-full">
        <svg class="w-9 h-9 -mr-0.5 absolute" viewBox="0 0 24 24" fill="none">
          <path d="M9 5l7 7-7 7" stroke="black" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>`;

    this.carouselWrapper.append(this.prevButton, this.nextButton);
  }

  setupPagination() {
    this.paginationDots = this.slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.className = `w-[0.5rem] aspect-square rounded-full transition-colors duration-300 
        ${
          index === this.currentSlide ? "bg-black" : "bg-[#E5E5E5]"
        } cursor-pointer`;
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
      dot.setAttribute(
        "aria-current",
        index === this.currentSlide ? "true" : "false"
      );

      // Add click handler
      dot.addEventListener("click", () => {
        this.currentSlide = index;
        this.updateSlides();
        dot.focus();
      });

      return dot;
    });

    // Clear and append new dots
    this.paginationContainer.textContent = "";
    this.paginationDots.forEach((dot) =>
      this.paginationContainer.appendChild(dot)
    );
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
      this.currentSlide = this.slides.length - 1;
    }
    this.updateSlides();
  }

  nextSlide() {
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
    } else {
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

    this.prevButton.style.display = isFirstSlide ? "none" : "flex";
    this.nextButton.style.display = isLastSlide ? "none" : "flex";

    this.updateSlidesDimensions();

    // Update pagination dots
    this.updatePagination();
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

  updatePagination() {
    this.paginationDots.forEach((dot, index) => {
      dot.className = `w-[0.5rem] aspect-square rounded-full transition-colors duration-300 
        ${
          index === this.currentSlide ? "bg-black" : "bg-[#E5E5E5]"
        } cursor-pointer`;
      dot.setAttribute(
        "aria-current",
        index === this.currentSlide ? "true" : "false"
      );
    });
  }

  render() {
    // Add carousel wrapper to main container
    this.carouselWrapper.append(this.slideTrack);
    this.mainContainer.appendChild(this.carouselWrapper);

    // Add pagination below carousel
    this.mainContainer.appendChild(this.paginationContainer);
  }
}

export default function decorate(block) {
  const carousel = new OffersCarousel(block);
  carousel.render();
}
