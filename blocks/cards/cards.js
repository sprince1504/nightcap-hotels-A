import React, { useEffect } from 'react';
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const Cards = ({ block }) => {
  useEffect(() => {
    if (!block) return;
    
    const listItems = [...block.children].map((row, index) => {
      const li = document.createElement('li');
      moveInstrumentation(row, li);
      
      while (row.firstElementChild) li.append(row.firstElementChild);
      
      [...li.children].forEach((div) => {
        if (div.children.length === 1 && div.querySelector('picture')) {
          div.className = 'cards-card-image';
        } else {
          div.className = 'cards-card-body';
        }
      });
      
      return li;
    });
    
    listItems.forEach((li) => {
      li.querySelectorAll('picture > img').forEach((img) => {
        const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
        moveInstrumentation(img, optimizedPic.querySelector('img'));
        img.closest('picture').replaceWith(optimizedPic);
      });
    });
    
    block.textContent = '';
    const ul = document.createElement('ul');
    listItems.forEach((li) => ul.append(li));
    block.append(ul);
  }, [block]);

  return <div ref={(el) => el && (block = el)} className="cards-container" />;
};

export default Cards;
