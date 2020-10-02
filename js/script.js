document.addEventListener('DOMContentLoaded', () => {

    //Tabs

    const tabs = document.querySelectorAll(".tabheader__item"),
        tabsContent = document.querySelectorAll(".tabcontent"),
        tabsParent = document.querySelector(".tabheader__items");


    function hideTabContent() {
        tabsContent.forEach(item => {
            item.classList.add('hide');
            item.classList.remove('show', 'fade');
        });

        tabs.forEach(item => {
            item.classList.remove('tabheader__item_active');
        });
    }


    function showTabContent(i = 0) {
        tabsContent[i].classList.add('show', 'fade');
        tabsContent[i].classList.remove('hide');
        tabs[i].classList.add('tabheader__item_active');

    }

    hideTabContent();
    showTabContent();


    tabsParent.addEventListener('click', event => {
        const target = event.target;
        if (target && target.classList.contains('tabheader__item')) {
            tabs.forEach((item, index) => {
                if (target == item) {
                    hideTabContent();
                    showTabContent(index);
                }
            });
        }
    });

    //Timer
    const deadline = '2020-10-17';

    function getTimeRemaining(endtime) {
        const t = Date.parse(endtime) - Date.parse(new Date()),
            days = Math.floor(t / (1000 * 60 * 60 * 24)),
            hours = Math.floor((t / (1000 * 60 * 60)) % 24),
            minutes = Math.floor((t / 1000 / 60) % 60),
            seconds = Math.floor((t / 1000) % 60);
        return {
            total: t,
            days,
            hours,
            minutes,
            seconds
        };
    }

    function getZero(num) {
        if (num >= 0 && num < 10) {
            return `0${num}`;
        } else {
            return num;
        }
    }

    function setClock(selector, endtime) {
        const timer = document.querySelector(selector),
            days = timer.querySelector("#days"),
            hours = timer.querySelector("#hours"),
            minutes = timer.querySelector("#minutes"),
            seconds = timer.querySelector("#seconds"),
            timeInterval = setInterval(updateClock, 1000);

        updateClock();

        function updateClock() {
            const t = getTimeRemaining(endtime);
            days.innerHTML = getZero(t.days);
            hours.innerHTML = getZero(t.hours);
            minutes.innerHTML = getZero(t.minutes);
            seconds.innerHTML = getZero(t.seconds);

            if (t.total <= 0) {
                clearInterval(timeInterval);
            }
        }
    }

    setClock(".timer", deadline);

    //Modal

    const modal = document.querySelector('.modal'),
        modalBtn = document.querySelectorAll("[data-modal]");



    function closeModal() {
        modal.classList.add('hide');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    function openModal() {
        modal.classList.add('show');
        modal.classList.remove('hide');
        document.body.style.overflow = 'hidden';
        clearInterval(modalTimerId);
    }


    modalBtn.forEach(item => {
        item.addEventListener('click', openModal);
    });



    modal.addEventListener('click', (event) => {
        if (event.target == modal || event.target.getAttribute('data-close') == '') {
            closeModal();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === "Escape" && modal.classList.contains('show')) {
            closeModal();
        }
    });

    // const modalTimerId = setTimeout(openModal, 3000);

    function showModalByScroll() {
        if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
            openModal();
            window.removeEventListener('scroll', showModalByScroll);
        }

    }

    window.addEventListener('scroll', showModalByScroll);

    //Menu card
    const menu = document.querySelector('.menu'),
        menuContainer = menu.querySelector('.container');

    const getResource = async(url) => {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Could not fetch ${url}, status: ${res.status}`);
        }
        return await res.json();
    };

    getResource('http://localhost:3000/menu')
        .then(data => {
            data.forEach(({ img, altimg, title, descr, price }) => {
                new MenuCard(altimg, title, descr, price, ".menu .container").render();
            });
        });
    class MenuCard {
        constructor(img, title, text, price, parentSelector, ...classes) {
            this.img = img;
            this.title = title;
            this.text = text;
            this.price = price;
            this.classes = classes;
            this.parent = document.querySelector(parentSelector);
            this.transfer = 27;
            this.changeToUAH();
        }
        changeToUAH() {
            this.price = this.price * this.transfer;
        }
        render() {
            const element = document.createElement('div');
            if (this.classes.length === 0) {
                this.element = 'menu__item';
                element.classList.add(this.element);
            }
            this.classes.forEach(className => element.classList.add(className));
            element.innerHTML = `
            <img src="img/tabs/${this.img}.jpg" alt="vegy">
            <h3 class="menu__item-subtitle">${this.title}</h3>
            <div class="menu__item-descr">${this.text}</div>
            <div class="menu__item-divider"></div>
            <div class="menu__item-price">
                <div class="menu__item-cost">Цена:</div>
                <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
            </div>`;
            this.parent.append(element);
        }
    }


    //Forms

    const forms = document.querySelectorAll('form');

    const message = {
        loading: "img/form/spinner.svg",
        success: "SUCCESS",
        failure: "Sorry! Something went wrong..."
    }

    forms.forEach(item => {
        bindPostData(item);
    });

    const postData = async(url, data) => {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                'Content-type': 'application/json',
            },
            body: data
        });
        return await res.json();
    };

    function bindPostData(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const statusMessage = document.createElement('img');
            statusMessage.src = message.loading;
            statusMessage.style.cssText = `
                display:block;
                margin: 0 auto
            `;
            form.insertAdjacentElement('afterend', statusMessage);


            const formData = new FormData(form);

            const json = Object.fromEntries(formData.entries());
            console.log(json);

            postData('http://localhost:3000/requests', JSON.stringify(json))
                .then(data => {
                    console.log(data);
                    showThanksModal(message.success);
                    statusMessage.remove();
                })
                .catch(() => {
                    showThanksModal(message.failure);
                })
                .finally(() => {
                    form.reset();
                });
        });
    }

    function showThanksModal(message) {
        const prevModalDialog = document.querySelector(".modal__dialog");
        prevModalDialog.classList.add('hide');
        openModal();

        const newModalDialog = document.createElement('div');
        newModalDialog.classList.add(".modal__dialog");
        newModalDialog.innerHTML = `
            <div class="modal__content">
                <div class="modal__close" data-close>×</div>
                <div class="modal__title">${message}</div>
            </div>
        `;

        document.querySelector('.modal').append(newModalDialog);
        setTimeout(() => {
            newModalDialog.remove();
            prevModalDialog.classList.add('show');
            prevModalDialog.classList.remove('hide');
            closeModal();
        }, 4000);
    }

    //Slider
    const slideImg = document.querySelectorAll('.offer__slide'),
        slidePrevBtn = document.querySelector('.offer__slider-prev'),
        slideNextBtn = document.querySelector('.offer__slider-next'),
        currentSlide = document.querySelector('#current'),
        totalSlide = document.querySelector('#total'),
        slideWrapper = document.querySelector('.offer__slider-wrapper'),
        slideField = document.querySelector('.offer__slider-inner'),
        width = window.getComputedStyle(slideWrapper).width,
        slider = document.querySelector('.offer__slider');

    let slideIndex = 1,
        offset = 0;

    slideField.style.width = 100 * slideImg.length + '%';
    slideField.style.display = 'flex';
    slideField.style.transition = '0.5s all';

    slideWrapper.style.overflow = 'hidden';

    if (slideImg.length < 10) {
        totalSlide.textContent = `0${slideImg.length}`;
        currentSlide.textContent = `0${slideIndex}`;
    } else {
        totalSlide.textContent = slideImg.length;
        currentSlide.textContent = slideIndex;
    }
    slider.style.position = 'relative';
    let indicators = document.createElement('ol'),
        dots = [];

    slider.appendChild(indicators);

    indicators.classList.add('carousel-indicators');

    slideImg.forEach((slide, index) => {
        let dot = document.createElement('li');
        dot.classList.add('dot');
        dot.setAttribute('data-dot', index + 1);
        if (index == 0) {
            dot.style.opacity = 1;
        }
        indicators.appendChild(dot);
        dots.push(dot);
    });




    slideNextBtn.addEventListener('click', () => {
        if (offset == deleteStr(width) * (slideImg.length - 1)) {
            offset = 0;
        } else {
            offset += +width.slice(0, width.length - 2);
        }
        slideField.style.transform = `translateX(-${offset}px)`;

        if (slideIndex === slideImg.length) {
            slideIndex = 1;
        } else {
            ++slideIndex;
        }

        slideAddZero();
        activeDot();
    });

    slidePrevBtn.addEventListener('click', () => {
        if (offset <= 0) {
            offset = deleteStr(width) * (slideImg.length - 1);
        } else {
            offset -= deleteStr(width);
        }

        slideField.style.transform = `translateX(-${offset}px)`;

        if (slideIndex === 1) {
            slideIndex = slideImg.length;
        } else {
            --slideIndex;
        }

        slideAddZero();
        activeDot();

    });

    dots.forEach(dot => {
        dot.addEventListener('click', e => {
            let slideTo = e.target.getAttribute('data-dot');

            slideIndex = slideTo;
            offset = deleteStr(width) * (slideTo - 1);
            slideField.style.transform = `translateX(-${offset}px)`;

            slideAddZero();
            activeDot();
            console.log(slideIndex);
        });
    });

    function activeDot() {
        dots.forEach(dot => dot.style.opacity = '.5');
        dots[slideIndex - 1].style.opacity = 1;
    }

    function slideAddZero() {
        if (slideImg.length < 10) {
            currentSlide.textContent = `0${slideIndex}`;
        } else {
            currentSlide.textContent = slideIndex;
        }
    }

    function deleteStr(str) {
        return +str.replace(/\D/g, "");
    }


    //Calculator
    const result = document.querySelector('.calculating__result span');

    let sex,
        ratio,
        height, weight, age;

    if (localStorage.getItem('sex')) {
        sex = localStorage.getItem('sex');
    } else {
        sex = 'female';
        localStorage.setItem('sex', 'female');
    }

    if (localStorage.getItem('ratio')) {
        ratio = localStorage.getItem('ratio');
    } else {
        ratio = 'female';
        localStorage.setItem('ratio', 1.375);
    }

    function calcTotal() {
        if (!sex || !ratio || !height || !weight || !age) {
            result.innerHTML = "_____";
            return;
        }

        if (sex == 'female') {
            result.innerHTML = Math.round((447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age)) * ratio);
        } else {
            result.innerHTML = Math.round((88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age)) * ratio);
        }
    }

    function initLocalSetting(selector, activeClass) {
        let elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.classList.remove(activeClass);

            if (localStorage.getItem('sex') == element.getAttribute('id')) {
                element.classList.add(activeClass);
            }

            if (localStorage.getItem('ratio') == element.getAttribute('data-ratio')) {
                element.classList.add(activeClass);
            }
        });
    }

    initLocalSetting('#gender div', 'calculating__choose-item_active');
    initLocalSetting('.calculating__choose_big div', 'calculating__choose-item_active');

    function getStaticInformation(parentSelector, activeClass) {
        let elements = document.querySelectorAll(`${parentSelector} div`);
        elements.forEach(elem => {
            elem.addEventListener('click', e => {
                if (e.target.getAttribute('data-ratio')) {
                    ratio = +e.target.getAttribute('data-ratio');
                    localStorage.setItem('ratio', +e.target.getAttribute('data-ratio'));
                } else {
                    sex = e.target.getAttribute('id');
                    localStorage.setItem('sex', e.target.getAttribute('id'));
                }

                elements.forEach(item => {
                    item.classList.remove(activeClass);
                    e.target.classList.add(activeClass);

                });

                calcTotal();

            });

        });
    }
    getStaticInformation('#gender', 'calculating__choose-item_active');
    getStaticInformation('.calculating__choose_big', 'calculating__choose-item_active');


    function getDynamicInformation(selector) {
        const input = document.querySelector(selector);
        input.addEventListener('input', e => {

            if (e.target.value.match(/\D/)) {
                e.target.style.border = '1px solid red';
            } else {
                e.target.style.border = 'none';
            }

            switch (e.target.getAttribute('id')) {
                case 'weight':
                    weight = +e.target.value;
                    break;
                case 'height':
                    height = +e.target.value;
                    break;
                case 'age':
                    age = +e.target.value;
                    break;

            }
            calcTotal();
        });
    }

    getDynamicInformation("#weight");
    getDynamicInformation("#height");
    getDynamicInformation("#age");


});