(function ($) {
var hwSlideSpeed = 700;
var hwTimeOut = 3000;
var hwNeedLinks = true;

$(document).ready(function(e) {
	$('.slide').css(
		{"position" : "absolute",
		 "top":'0', "left": '0'}).hide().eq(0).show();
	var slideNum = 0;
	var slideTime;
	var videoPlaying = false; // true when a slide video is actively playing (user or autoplay)
	slideCount = $("#slider .slide").size();

	// Pause every video inside the slider
	function pauseAllSlideVideos() {
		$('#slider .slide video').each(function () {
			try { this.pause(); } catch(e) {}
		});
		// if we pause all videos programmatically, make sure rotation can continue
		videoPlaying = false;
	}

	// Try to play the video in the current slide (index provided)
	function tryPlaySlideVideo(index) {
		var el = $('.slide').eq(index).find('video').get(0);
		if (!el) return;
		el.muted = true; // muted so autoplay usually works
		el.loop = true;
		// attach handlers to control auto-rotation while the video plays
		el.onplay = function() {
			videoPlaying = true;
			clearTimeout(slideTime);
		};
		el.onpause = function() {
			videoPlaying = false;
			rotator();
		};
		el.onended = function() {
			videoPlaying = false;
			rotator();
		};
		var playPromise = el.play();
		if (playPromise && playPromise.catch) {
			playPromise.catch(function () {
				// autoplay blocked — user can press play via controls
			});
		}
	}

	// Try to start playing video for the first visible slide
	// (slides are hidden above and the first slide is shown)
	tryPlaySlideVideo(0);

	// Attach handlers that will show the poster/fallback image when a video fails
	function attachVideoFallbackHandlers() {
		$('#slider .slide').each(function () {
			var $slide = $(this);
			var vid = $slide.find('video').get(0);
			var $fallback = $slide.find('.slide-video-fallback');
			// attach or locate overlay used to show error/debug info for this slide
			var $overlay = $slide.find('.video-error-overlay');
			if (!$overlay.length) {
				// append to slide anchor when available, otherwise to slide itself
				var $overlayContainer = $slide.find('a').length ? $slide.find('a') : $slide;
				$overlay = $('<div class="video-error-overlay" aria-hidden="true" style="display:none"></div>').appendTo($overlayContainer);
			}
			if (!$fallback.length) return; // nothing to do

			// no click-to-play overlay required — autoplay will attempt and user can use native controls
			if (!vid) { $fallback.show(); return; }

			// When video can play, hide fallback and the play overlay
			$(vid).on('loadeddata canplay canplaythrough', function () {
					try { $overlay.hide(); $fallback.hide(); $(vid).show(); } catch (e) {}
			});

			// On error or no data — show fallback and play overlay and debug overlay
			$(vid).on('error emptied stalled', function () {
				try {
					$(vid).hide();
					$fallback.show();
					// play overlay removed — just show fallback and debug overlay
					// show useful debug overlay linking to the video src so user can open it in a new tab
					var src = $(vid).find('source').attr('src') || vid.currentSrc || '';
					$overlay.html('<strong>Video load failed</strong><br><a href="' + src + '" target="_blank" rel="noopener noreferrer">Open source</a>').show();
				} catch (e) {}
			});

			// Initial quick check: if the video already has an error or no data, reveal fallback
			try {
				if (vid.error || vid.readyState === 0) {
					$(vid).hide();
					$fallback.show();
					// play overlay removed — just show fallback and debug overlay
					var src = $(vid).find('source').attr('src') || vid.currentSrc || '';
					$overlay.html('<strong>Video not ready</strong><br><a href="' + src + '" target="_blank" rel="noopener noreferrer">Open source</a>').show();
				} else {
					$fallback.hide();
					$overlay.hide();
					// no overlay to hide
					$(vid).show();
				}
			} catch (e) {}
		});
	}

	attachVideoFallbackHandlers();
	var animSlide = function(arrow){
		clearTimeout(slideTime);
		// pause any videos playing in the outgoing slide
		pauseAllSlideVideos();
		$('.slide').eq(slideNum).fadeOut(hwSlideSpeed);
		if(arrow == "next"){
			if(slideNum == (slideCount-1)){slideNum=0;}
			else{slideNum++}
			}
		else if(arrow == "prew")
		{
			if(slideNum == 0){slideNum=slideCount-1;}
			else{slideNum-=1}
		}
		else{
			slideNum = arrow;
			}
		$('.slide').eq(slideNum).fadeIn(hwSlideSpeed, function() {
			tryPlaySlideVideo(slideNum);
			rotator();
		});
		$(".control-slide.active").removeClass("active");
		$('.control-slide').eq(slideNum).addClass('active');
		}
if(hwNeedLinks){
var $linkArrow = $('<a id="prewbutton" href="#">&lt;</a><a id="nextbutton" href="#">&gt;</a>')
	.prependTo('#slider');		
	$('#nextbutton').click(function(){
		animSlide("next");
		return false;
		})
	$('#prewbutton').click(function(){
		animSlide("prew");
		return false;
		})
}
	var $adderSpan = '';
	$('.slide').each(function(index) {
			$adderSpan += '<span class = "control-slide">' + index + '</span>';
		});
	$('<div class ="sli-links">' + $adderSpan +'</div>').appendTo('#slider-wrap');
	$(".control-slide:first").addClass("active");
	$('.control-slide').click(function(){
	var goToNum = parseFloat($(this).text());
	animSlide(goToNum);
	});
	var pause = false;
	var rotator = function(){
			// only rotate when not paused by hover and no video is currently playing
			if(!pause && !videoPlaying){
				slideTime = setTimeout(function(){animSlide('next')}, hwTimeOut);
			}
	}
	$('#slider-wrap').hover(    
		function(){
			clearTimeout(slideTime);
			pause = true;
			// when user hovers the slider, pause rotation and any playing videos
			pauseAllSlideVideos();
		},
		function(){
			pause = false;
			rotator();
			// resume current slide video if present
			tryPlaySlideVideo(slideNum);
		});
	rotator();

	// Reveal-on-scroll animation for sections
	var revealElements = $('.reveal');

	if ('IntersectionObserver' in window) {
		var observer = new IntersectionObserver(function(entries) {
			entries.forEach(function(entry) {
				if (entry.isIntersecting) {
					$(entry.target).addClass('reveal_visible');
					observer.unobserve(entry.target);
				}
			});
		}, { threshold: 0.15 });

		revealElements.each(function() {
			observer.observe(this);
		});
	} else {
		// Fallback for very old browsers
		var revealOnScroll = function() {
			var windowBottom = $(window).scrollTop() + $(window).height();
			revealElements.each(function() {
				var $el = $(this);
				if ($el.offset().top < windowBottom - 60) {
					$el.addClass('reveal_visible');
				}
			});
		};
		$(window).on('scroll resize', revealOnScroll);
		revealOnScroll();
	}

	// Simple i18n for RU/EN
	var translations = {
		en: {
			subtitle: 'Unity Game Developer',
			'nav.about': 'About me',
			'nav.experience': 'Experience',
			'nav.skills': 'Skills',
			'nav.achievements': 'Achievements',
			'nav.games': 'My Projects',
			'nav.privacy': 'Privacy Policy',
			'nav.feedback': 'Feedback',
			'about.title': 'About me',
			'about.p1': 'Hi! My name is <b>Nikita Chebotov</b>, I am a C# Unity developer.',
			'about.p2': 'I have more than 8 years of development experience, including 5 years as a Unity developer at Black Bears and experience at Azur Games.',
			'about.p3': 'I work on mobile games and VR projects, from match‑3 and idle RPGs to a full VR arena ecosystem. I also develop personal projects in various genres: clickers, idle games, fighting games, management simulators, and platformers for Android, PC, and WebGL.',
			'about.p4': 'I have experience as a lead developer on successful mobile projects and mentoring in VR simulator development.',
			'about.btn.games': 'View my games',
			'about.btn.contact': 'Contact me',
			'games.eyebrow': 'Portfolio',
			'games.title': 'My Projects',
			'games.tapSwapTitle': 'Tap Swap',
			'games.tapSwapMeta': 'Arcade tap game for Android. Simple controls, fast sessions and score chasing.',
			'games.projectBattleTitle': 'Project Battle',
			'games.projectBattleMeta': 'Prototype of an action game. Open-source project with experiments in combat mechanics.',
			'games.pixelRenderFeatureTitle': 'Pixel Render Feature',
			'games.pixelRenderFeatureMeta': 'Custom optimized render feature for pixeling 3D games',
			'games.mergeGameEngineTitle': 'Merge Game Engine',
			'games.mergeGameEngineMeta': 'An engine for the implementation of games such as suika game. Still work in progress for new features. Now it contains basic functions.',
			'games.knukleFightTitle': 'Knukle Fight',
			'games.knukleFightMeta': 'Prototype of knukle fight simulator',
			'games.spaceClickerTitle': 'Space Clicker',
			'games.spaceClickerMeta': 'Prototype of clicker managment game into space',
			'games.platformerGameJamTitle': 'Platformer',
			'games.platformerGameJamMeta': 'Platformer for DTF GameJam in 2 days develope',
			'games.tlou2Title': 'Player Controller',
			'games.tlou2Meta': 'Prototype of player controller clone of The Last of Us 2',
			'games.storeTitle': 'Store Stories',
			'games.storeMeta': 'Prototype of PaperPlease like game into store',
			'experience.eyebrow': 'Career',
			'experience.title': 'Work Experience',
			'experience.azur.title': 'Azur Games – Unity Developer',
			'experience.azur.period': 'July 2025 – November 2025',
			'experience.azur.project.title': 'RailRoad Empire',
			'experience.azur.project.p1': 'Implemented full development cycle of game features: from architecture design and requirements approval to coding, testing, and integration.',
			'experience.azur.project.p2': 'Actively participated in project improvements: proposed architectural enhancements, workflow optimization, and code quality improvements (including introducing checklists and testing practices).',
			'experience.azur.project.p3': 'Wrote unit tests for critical components, ensuring stability when scaling the project.',
			'experience.azur.project.p4': 'Used Zenject to build flexible, modular, and easily testable architecture.',
			'experience.azur.project.p5': 'Integrated external SDKs.',
			'experience.blackbears.title': 'Black Bears, Tambov – Unity Developer',
			'experience.blackbears.period': 'August 2020 – July 2025',
			'experience.blackbears.color.title': 'Color Mystery: Happy match 3',
			'experience.blackbears.color.p1': 'Maintained and refactored a mobile match-3 and coloring game.',
			'experience.blackbears.color.p2': 'Developed tutorials for core game mechanics, independently created a meta event.',
			'experience.blackbears.color.p3': 'UI layout.',
			'experience.blackbears.fishing.title': 'Grand Fishing Game',
			'experience.blackbears.fishing.p1': 'Organized project architecture, developed features. Created technical specifications for 3D artists.',
			'experience.blackbears.fishing.p2': 'Created an editor for optimizing 3D locations, average FPS increased by 2x.',
			'experience.blackbears.fishing.p3': 'Developed AI for PVP mode, configurable by game designers through config files.',
			'experience.blackbears.legion.title': 'Legionlands: auto battler game',
			'experience.blackbears.legion.p1': 'Worked with LeoECS. Participated in code refactoring and implementing new mechanics.',
			'experience.blackbears.legion.p2': 'Optimized "fog of war" on the game map, FPS increased by 3x.',
			'experience.blackbears.legend.title': 'Legendlands - The Legendary RPG',
			'experience.blackbears.legend.p1': 'Implemented UI using MVVM pattern.',
			'experience.blackbears.legend.p2': 'Developed a system of customizable 3D screens with animated elements affecting gameplay, with depth effect via accelerometer.',
			'experience.blackbears.legend.p3': 'Integrated client application with game server for player data synchronization and online features.',
			'experience.blackbears.endless.title': 'Endless lands - idle RPG',
			'experience.blackbears.endless.p1': 'As lead developer, synchronized programmers\' work and assigned tasks.',
			'experience.blackbears.endless.p2': 'As part of the team, implemented the project from concept to beta version in 2 months.',
			'experience.blackbears.vr.title': 'Black Bears VR Arena',
			'experience.blackbears.vr.p1': 'Participated in developing an ecosystem for a VR arena. Optimized all 3D locations, achieving 1.5x FPS increase.',
			'experience.blackbears.vr.p2': 'Developed a calibration algorithm for VR devices at a single point to synchronize position in real and virtual spaces.',
			'experience.blackbears.vr.p3': 'Implemented location coloring mechanics and prepared for network play.',
			'experience.blackbears.vr.p4': 'Developed modular AI architecture, reducing time to implement new AI opponents from several hours to 1 hour.',
			'experience.personal.title': 'Personal Projects',
			'experience.personal.period': '2018 – 2021',
			'experience.personal.desc': 'Developed educational PCVR simulators, a mobile app for employee attendance tracking, and a Windows Forms application for image processing.',
			'skills.eyebrow': 'Technical',
			'skills.title': 'Skills',
			'skills.architecture.title': 'Architecture & Patterns',
			'skills.architecture.p1': 'OOP, SOLID, GoF Patterns, MV Pattern',
			'skills.architecture.p2': 'MVVM, Dependency Injection (Zenject, VContainer)',
			'skills.unity.title': 'Unity & C#',
			'skills.unity.p1': 'Unity Engine, C#',
			'skills.unity.p2': 'Addressables, Asset Management',
			'skills.unity.p3': 'ECS (LeoECS, Morpeh ECS)',
			'skills.libraries.title': 'Libraries & Frameworks',
			'skills.libraries.p1': 'UniRx, UniTask, R3',
			'skills.libraries.p2': 'DOTween',
			'skills.libraries.p3': 'FishNet (Multiplayer)',
			'skills.integration.title': 'Integration & Optimization',
			'skills.integration.p1': 'Third-party SDK integration (AppLovin, Firebase, Yandex, etc.)',
			'skills.integration.p2': '3D scene optimization, UI optimization, code optimization',
			'achievements.eyebrow': 'Highlights',
			'achievements.title': 'Achievements',
			'achievements.p1': 'Participated in several game jams and hackathons, winning 1st and 3rd places',
			'achievements.p2': 'Developed a mobile game from concept to beta version in 2 months',
			'achievements.p3': 'Organized project architectures',
			'achievements.p4': 'Created a comprehensive ecosystem for a VR arena, including a client for headsets, a Windows server application, a mobile companion app, and a launcher for equipment setup',
			'achievements.p5': 'Created projects using LeoECS, Morpeh ECS',
			'achievements.p6': 'Created a multiplayer project using FishNet',
			'education.eyebrow': 'Background',
			'education.title': 'Education',
			'education.degree': 'Master\'s Degree in Computer Science',
			'education.university': 'Tambov State Technical University (TSTU), Tambov',
			'education.period': '2021 – 2023',
			'privacy.eyebrow': 'Legal',
			'privacy.title': 'PRIVACY POLICY',
			'privacy.intro': 'This privacy policy governs your use of the software applications for mobile devices that was created by Chebotov Nikita. The Applications are mobile video games.',
			'privacy.section1.summary': 'Information we use',
			'privacy.section1.title1': 'Information used by application',
			'privacy.section1.title2': 'User Provided Information',
			'privacy.section1.p1': 'The Applications currently do not collect any user provided information.',
			'privacy.section1.p2': 'We may also use the information you provided us to contact you from time to time to provide you with important information, required notices and marketing promotions.',
			'privacy.section2.summary': 'Automatic data and device information',
			'privacy.section2.title1': 'Automatically Collected Information',
			'privacy.section2.p1': 'The Applications may collect certain information automatically, including, but not limited to, the type of mobile device you use, your mobile device\'s <abbr title="Identifier For Advertisers">IDFA</abbr> (for advertising), your mobile operating system, and information about the way you use the Application.',
			'privacy.section2.title2': 'Collecting precise real time location information of the device',
			'privacy.section2.p2': 'This Application does not collect precise information about the location of your mobile device.',
			'privacy.section3.summary': 'Third parties and advertising',
			'privacy.section3.title1': 'Third parties access to information obtained by the Application',
			'privacy.section3.p1': 'We will share your information with third parties only in the ways that are described in this privacy statement.',
			'privacy.section3.p2': 'We may disclose User Provided and Automatically Collected Information:',
			'privacy.section3.p3': '- as required by law, such as to comply with a subpoena, or similar legal process;',
			'privacy.section3.p4': '- when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a government request;',
			'privacy.section3.p5': '- with our trusted services providers who work on our behalf, do not have an independent use of the information we disclose to them, and have agreed to adhere to the rules set forth in this privacy statement;',
			'privacy.section3.p6': '- if Chebotov Nikita is involved in a merger, acquisition, or sale of all or a portion of its assets, you will be notified via email and/or a prominent notice on our website of any change in ownership or uses of this information, as well as any choices you may have regarding this information;',
			'privacy.section3.p7': '- to advertisers and third party advertising networks and analytics companies as described in the section below.',
			'privacy.section3.title2': 'Automatic Data Collection and Advertising',
			'privacy.section3.p8': 'We may work with analytics companies to help us understand how the Application is being used, such as the frequency and duration of usage. We work with advertisers and third party advertising networks, who need to know how you interact with advertising provided in the Application which helps us keep the cost of the Application low. Advertisers and advertising networks use some of the information collected by the Application, including, but not limited to, the unique identification IDs of your mobile device. To protect the anonymity of this information, we use an encryption technology to help ensure that these third parties can’t identify you personally.',
			'privacy.section3.p9': 'If you’d like to opt-out from third party use of this type of information to help serve targeted advertising, please visit the section entitled “Opt-out” below.',
			'privacy.section4.summary': 'Your choices and data retention',
			'privacy.section4.title1': 'Opt-out rights',
			'privacy.section4.p1': 'There are multiple opt-out options for users of this Application:',
			'privacy.section4.p2': 'Opt-out of all information collection by uninstalling the Application: You can stop all collection of information by the Application easily by uninstalling the Application. You may use the standard uninstall processes as may be available as part of your mobile device or via the mobile application marketplace or network.',
			'privacy.section4.p3': 'Opt-out from the use of information to serve targeted advertising by advertisers and/or third party network advertisers: you may at any time opt-out from further allowing us to have access to your <acronym title="Identifier For Advertisers">IDFA</acronym> in the operating system settings.',
			'privacy.section4.p4': 'Data Retention Policy, Managing Your Information.',
			'privacy.section4.p5': 'We will retain User Provided data for as long as you use the Application and for a reasonable time thereafter. We will retain Automatically Collected information for up to 48 months and thereafter may store it in aggregate. Please note that some or all of the User Provided Data may be required in order for the Application to function properly.',
			'privacy.section5.summary': 'Security and changes',
			'privacy.section5.title1': 'Security',
			'privacy.section5.p1': 'We are concerned about safeguarding the confidentiality of your information. We provide physical, electronic, and procedural safeguards to protect information we process and maintain. For example, we limit access to this information to authorized employees and contractors who need to know that information in order to operate, develop or improve our Application. Please be aware that, although we endeavor provide reasonable security for information we process and maintain, no security system can prevent all potential security breaches.',
			'privacy.section5.title2': 'Changes',
			'privacy.section5.p2': 'This Privacy Policy may be updated from time to time for any reason. We will notify you of any changes to our Privacy Policy by posting the new Privacy Policy here. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.',
			'contact.title': 'Contact',
			'contact.text': 'If you have any questions or would like to discuss a project, feel free to contact me:',
			'contact.mailLabel': 'Mail:',
			'contact.telegram': 'Telegram: <a href="https://t.me/Chobotov" target="_blank" rel="noopener noreferrer">@Chobotov</a>',
			'contact.github': 'GitHub: <a href="https://github.com/Chobotov" target="_blank" rel="noopener noreferrer">github.com/Chobotov</a>',
			'contact.linkedin': 'LinkedIn: <a href="https://www.linkedin.com/in/nikita-chobotov-065b68193" target="_blank" rel="noopener noreferrer">linkedin.com/in/nikita-chobotov-065b68193</a>',
			'contact.timezone': 'Timezone: GMT+3',
			footer: '©2019 Chobotov'
		},
		ru: {
			subtitle: 'Unity‑разработчик игр',
			'nav.about': 'Обо мне',
			'nav.experience': 'Опыт работы',
			'nav.skills': 'Навыки',
			'nav.achievements': 'Достижения',
			'nav.games': 'Мои проекты',
			'nav.privacy': 'Политика конфиденциальности',
			'nav.feedback': 'Обратная связь',
			'about.title': 'Обо мне',
			'about.p1': 'Привет! Меня зовут <b>Никита Чеботов</b>, я C# Unity‑разработчик.',
			'about.p2': 'Занимаюсь разработкой более 8 лет, из них 5 лет — Unity‑разработчик в компании Black Bears и опыт работы в Azur Games.',
			'about.p3': 'Работаю над мобильными играми и VR‑проектами: от match‑3 и idle RPG до полноценной экосистемы для VR‑арены. Параллельно разрабатываю собственные проекты в различных жанрах: кликеры, idle‑игры, файтинги, менеджмент‑симуляторы и платформеры для платформ Android, PC и WebGL.',
			'about.p4': 'Имею опыт лид‑разработки успешного мобильного проекта и менторства в области создания VR‑симуляторов.',
			'about.btn.games': 'Смотреть игры',
			'about.btn.contact': 'Связаться со мной',
			'games.eyebrow': 'Портфолио',
			'games.title': 'Мои проекты',
			'games.tapSwapTitle': 'Tap Swap',
			'games.tapSwapMeta': 'Аркадная tap‑игра для Android. Простое управление, быстрые сессии и охота за рекордами.',
			'games.projectBattleTitle': 'Project Battle',
			'games.projectBattleMeta': 'Прототип экшен‑игры. Открытый проект с экспериментами в боевой системе.',
			'games.pixelRenderFeatureTitle': 'Pixel Render Feature',
			'games.pixelRenderFeatureMeta': 'Оптимизированная функция рендеринга для пикселизации 3D-игр',
			'games.mergeGameEngineTitle': 'Merge Game Engine',
			'games.mergeGameEngineMeta': 'Движок для реализации таких игр, как suika game. Продолжается работа над новыми функциями. Теперь он содержит базовые функции.',
			'games.knukleFightTitle': 'Knukle Fight',
			'games.knukleFightMeta': 'Прототип спортивного симулятора кулачных боев',
			'games.spaceClickerTitle': 'Space Clicker',
			'games.spaceClickerMeta': 'Прототип кликкера с элементами менеджемнта в стилистике космоса',
			'games.platformerGameJamTitle': 'Platformer',
			'games.platformerGameJamMeta': '2D платформе для DTF GameJam. Разработана за 2 дня.',
			'games.tlou2Title': 'Player Controller',
			'games.tlou2Meta': 'Прототип реализации контроллера персонажем из игры The Last of Us 2',
			'games.storeTitle': 'Store Stories',
			'games.storeMeta': 'Прототип PaperPlease подобной игры в сеттинге магазина',
			'experience.eyebrow': 'Карьера',
			'experience.title': 'Опыт работы',
			'experience.azur.title': 'Azur Games – Unity Developer',
			'experience.azur.period': 'Июль 2025 – Ноябрь 2025',
			'experience.azur.project.title': 'RailRoad Empire',
			'experience.azur.project.p1': 'Реализовывал полный цикл разработки игровых фич: от проектирования архитектуры и согласования требований до кодирования, тестирования и интеграции.',
			'experience.azur.project.p2': 'Активно участвовал в улучшении проекта: предлагал архитектурные улучшения, оптимизацию workflow и повышение качества кодовой базы (включая введение чек‑листов и практик тестирования).',
			'experience.azur.project.p3': 'Писал unit‑тесты для критически важных компонентов, обеспечивая стабильность при масштабировании проекта.',
			'experience.azur.project.p4': 'Использовал Zenject для построения гибкой, модульной и легко тестируемой архитектуры.',
			'experience.azur.project.p5': 'Интегрировал внешние SDK.',
			'experience.blackbears.title': 'Black Bears, Тамбов – Unity Developer',
			'experience.blackbears.period': 'Август 2020 – Июль 2025',
			'experience.blackbears.color.title': 'Color Mystery: Happy match 3',
			'experience.blackbears.color.p1': 'Занимался поддержкой и рефакторингом мобильной игры жанров Match‑3 и раскраски.',
			'experience.blackbears.color.p2': 'Разрабатывал туториалы для основных механик игры, самостоятельно написал мета ивент.',
			'experience.blackbears.color.p3': 'Верстка UI.',
			'experience.blackbears.fishing.title': 'Grand Fishing Game',
			'experience.blackbears.fishing.p1': 'Организация архитектуры проекта, разработка фич. Постановка ТЗ для 3D‑художников.',
			'experience.blackbears.fishing.p2': 'Написал редактор для оптимизации 3D‑локаций, среднее значение FPS увеличилось в 2 раза.',
			'experience.blackbears.fishing.p3': 'Написал ИИ для PVP режима, который мог настраиваться геймдизайнером через конфиг.',
			'experience.blackbears.legion.title': 'Legionlands: auto battler game',
			'experience.blackbears.legion.p1': 'Работа с LeoECS. Участвовал в рефакторинге кода и написании новых механик.',
			'experience.blackbears.legion.p2': 'Оптимизировал "туман войны" на игровой карте, FPS увеличился в 3 раза.',
			'experience.blackbears.legend.title': 'Legendlands - The Legendary RPG',
			'experience.blackbears.legend.p1': 'Написание работы UI с применением MVVM.',
			'experience.blackbears.legend.p2': 'Разработал систему настраиваемых 3D‑экранов с анимированными элементами, влияющими на игровой процесс, и эффектом объема через акселерометр.',
			'experience.blackbears.legend.p3': 'Интеграция клиентского приложения с игровым сервером для синхронизации данных игрока и онлайн функций.',
			'experience.blackbears.endless.title': 'Endless lands - idle RPG',
			'experience.blackbears.endless.p1': 'Как лид‑разработчик команды, синхронизировал работу программистов и назначал задачи.',
			'experience.blackbears.endless.p2': 'В составе команды реализовал проект от концепции до бета‑версии за 2 месяца.',
			'experience.blackbears.vr.title': 'Black Bears VR Arena',
			'experience.blackbears.vr.p1': 'Участие в разработке экосистемы для арены виртуальной реальности. Оптимизировал все 3D локации, за счет этого добился увеличения FPS в 1,5 раза.',
			'experience.blackbears.vr.p2': 'Разработал алгоритм калибровки VR‑устройств в единой точке для синхронизации позиции в реальном и виртуальном пространствах.',
			'experience.blackbears.vr.p3': 'Реализовал механику окрашивания локации в различные цвета и подготовил для работы по сети.',
			'experience.blackbears.vr.p4': 'Разработал модульную архитектуру ИИ, сократив время внедрения новых компьютерных противников с нескольких часов до 1 часа.',
			'experience.personal.title': 'Личные проекты',
			'experience.personal.period': '2018 – 2021',
			'experience.personal.desc': 'Разрабатывал обучающие PCVR‑симуляторы, мобильное приложение для учета посещаемости сотрудников и Windows Forms‑приложение для обработки изображений.',
			'skills.eyebrow': 'Технические',
			'skills.title': 'Навыки',
			'skills.architecture.title': 'Архитектура и паттерны',
			'skills.architecture.p1': 'ООП, SOLID, GoF Patterns, MV Pattern',
			'skills.architecture.p2': 'MVVM, Dependency Injection (Zenject, VContainer)',
			'skills.unity.title': 'Unity и C#',
			'skills.unity.p1': 'Unity Engine, C#',
			'skills.unity.p2': 'Addressables, управление ассетами',
			'skills.unity.p3': 'ECS (LeoECS, Morpeh ECS)',
			'skills.libraries.title': 'Библиотеки и фреймворки',
			'skills.libraries.p1': 'UniRx, UniTask, R3',
			'skills.libraries.p2': 'DOTween',
			'skills.libraries.p3': 'FishNet (мультиплеер)',
			'skills.integration.title': 'Интеграция и оптимизация',
			'skills.integration.p1': 'Интеграция сторонних SDK (AppLovin, Firebase, Yandex и т.д.)',
			'skills.integration.p2': 'Оптимизация сцен с 3D ассетами, UI и кода',
			'achievements.eyebrow': 'Достижения',
			'achievements.title': 'Достижения',
			'achievements.p1': 'Участвовал в нескольких игровых джемах и хакатонах, где занял 1‑е и 3‑е места',
			'achievements.p2': 'Разработка мобильной игры от концепта до бета‑версии за 2 месяца',
			'achievements.p3': 'Организовывал архитектуру проектов',
			'achievements.p4': 'Создание комплексной экосистемы для VR‑арены, включающей клиент для шлемов, Windows приложение‑сервер, мобильное приложение‑компаньон и лаунчер для настройки оборудования',
			'achievements.p5': 'Создавал проекты с использованием LeoECS, Morpeh ECS',
			'achievements.p6': 'Создавал проект с мультиплеером с использованием FishNet',
			'education.eyebrow': 'Образование',
			'education.title': 'Образование',
			'education.degree': 'Магистр по направлению "Информатика и вычислительная техника"',
			'education.university': 'ТГТУ, Тамбов',
			'education.period': '2021 – 2023',
			'privacy.eyebrow': 'Юридическая информация',
			'privacy.title': 'ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ',
			'privacy.intro': 'Эта политика конфиденциальности регулирует использование вами мобильных приложений, созданных Никитой Чеботовым. Приложения являются мобильными видеоиграми.',
			'privacy.section1.summary': 'Информация, которую мы используем',
			'privacy.section1.title1': 'Информация, используемая приложением',
			'privacy.section1.title2': 'Предоставленная пользователем информация',
			'privacy.section1.p1': 'В настоящее время приложения не собирают какую‑либо информацию, которую вы вводите самостоятельно.',
			'privacy.section1.p2': 'Мы можем использовать предоставленную вами информацию, чтобы время от времени связываться с вами и предоставлять важную информацию, обязательные уведомления и маркетинговые сообщения.',
			'privacy.section2.summary': 'Автоматические данные и информация об устройстве',
			'privacy.section2.title1': 'Автоматически собираемая информация',
			'privacy.section2.p1': 'Приложения могут автоматически собирать некоторую информацию, включая, но не ограничиваясь: тип вашего мобильного устройства, <abbr title="Identifier For Advertisers">IDFA</abbr> (для рекламы), версию операционной системы и информацию о том, как вы используете приложение.',
			'privacy.section2.title2': 'Сбор точной информации о местоположении устройства',
			'privacy.section2.p2': 'Приложения не собирают точную информацию о местоположении вашего мобильного устройства.',
			'privacy.section3.summary': 'Третьи стороны и реклама',
			'privacy.section3.title1': 'Доступ третьих сторон к информации, полученной приложением',
			'privacy.section3.p1': 'Мы передаём вашу информацию третьим сторонам только в случаях, описанных в настоящей политике конфиденциальности.',
			'privacy.section3.p2': 'Мы можем раскрывать предоставленную пользователем и автоматически собранную информацию:',
			'privacy.section3.p3': '- когда это требуется по закону, например для исполнения повестки или аналогичного юридического запроса;',
			'privacy.section3.p4': '- когда мы добросовестно считаем, что раскрытие необходимо для защиты наших прав, вашей безопасности или безопасности других лиц, расследования мошенничества или ответа на запрос госорганов;',
			'privacy.section3.p5': '- нашим надёжным сервис‑провайдерам, которые работают от нашего имени, не используют информацию самостоятельно и обязуются соблюдать правила, изложенные в данной политике;',
			'privacy.section3.p6': '- если Никита Чеботов участвует в слиянии, поглощении или продаже всех либо части активов, вы будете уведомлены по электронной почте и/или через заметное уведомление на сайте о любых изменениях владельца или использования информации, а также о ваших вариантах выбора;',
			'privacy.section3.p7': '- рекламодателям и рекламным сетям, а также компаниям веб‑аналитики, как описано ниже.',
			'privacy.section3.title2': 'Автоматический сбор данных и реклама',
			'privacy.section3.p8': 'Мы можем работать с компаниями аналитики, чтобы лучше понимать, как используется приложение (частота и длительность сессий). Мы также сотрудничаем с рекламодателями и рекламными сетями, которым необходимо знать, как вы взаимодействуете с рекламой, чтобы помогать нам поддерживать низкую стоимость приложений. Рекламодатели и рекламные сети могут использовать часть собираемой приложением информации, включая, но не ограничиваясь, уникальными идентификаторами вашего устройства. Чтобы защитить анонимность, мы используем технологии шифрования, препятствующие идентификации вас как конкретного человека.',
			'privacy.section3.p9': 'Если вы хотите отказаться от использования такого рода информации третьими сторонами для показа таргетированной рекламы, воспользуйтесь разделом «Opt‑out» в настройках вашей операционной системы.',
			'privacy.section4.summary': 'Ваш выбор и хранение данных',
			'privacy.section4.title1': 'Права на отказ (opt‑out)',
			'privacy.section4.p1': 'У пользователей есть несколько способов отказаться от сбора информации:',
			'privacy.section4.p2': 'Отказ от всего сбора информации путём удаления приложения: вы можете в любой момент удалить приложение, используя стандартные средства вашей операционной системы или магазина приложений.',
			'privacy.section4.p3': 'Отказ от использования информации для показа таргетированной рекламы рекламодателями и/или рекламными сетями: вы можете в любой момент закрыть доступ к вашему <acronym title="Identifier For Advertisers">IDFA</acronym> в настройках операционной системы.',
			'privacy.section4.p4': 'Политика хранения данных и управление информацией.',
			'privacy.section4.p5': 'Мы храним предоставленные пользователем данные столько, сколько вы пользуетесь приложением, и в течение разумного времени после этого. Автоматически собранная информация может храниться до 48 месяцев, после чего может быть агрегирована. Обратите внимание, что часть или все данные могут быть необходимы для корректной работы приложения.',
			'privacy.section5.summary': 'Безопасность и изменения',
			'privacy.section5.title1': 'Безопасность',
			'privacy.section5.p1': 'Мы заботимся о защите конфиденциальности вашей информации. Мы применяем физические, электронные и процедурные меры безопасности для защиты обрабатываемой и хранимой информации. Например, доступ к этим данным предоставляется только авторизованным сотрудникам и подрядчикам, которым эта информация необходима для работы, развития или улучшения приложений. Однако ни одна система безопасности не может гарантировать полную защиту от всех возможных нарушений.',
			'privacy.section5.title2': 'Изменения',
			'privacy.section5.p2': 'Настоящая политика конфиденциальности может время от времени обновляться по разным причинам. О любых изменениях мы будем сообщать, публикуя новую версию политики здесь. Рекомендуем периодически просматривать данную политику; продолжение использования приложений означает согласие со всеми изменениями.',
			'contact.title': 'Контакты',
			'contact.text': 'Если вы хотите задать вопрос или обсудить проект, напишите мне любым удобным способом:',
			'contact.mailLabel': 'Почта:',
			'contact.telegram': 'Telegram: <a href="https://t.me/Chobotov" target="_blank" rel="noopener noreferrer">@Chobotov</a>',
			'contact.github': 'GitHub: <a href="https://github.com/Chobotov" target="_blank" rel="noopener noreferrer">github.com/Chobotov</a>',
			'contact.linkedin': 'LinkedIn: <a href="https://www.linkedin.com/in/nikita-chobotov-065b68193" target="_blank" rel="noopener noreferrer">linkedin.com/in/nikita-chobotov-065b68193</a>',
			'contact.timezone': 'Часовой пояс: GMT+3',
			footer: '©2019 Чеботов Никита'
		}
	};

	function applyTranslations(lang) {
		var dict = translations[lang] || translations.en;

		$('[data-i18n]').each(function () {
			var key = $(this).data('i18n');
			if (!key || !(key in dict)) return;

			var value = dict[key];

			// privacy.title is inside <h2><bdo>...</bdo></h2>, replace text only
			if (key === 'privacy.title') {
				$(this).find('bdo').text(value);
			} else {
				$(this).html(value);
			}
		});

		// Update html lang attribute
		$('html').attr('lang', lang);

		// Update active state on language buttons
		$('.lang-btn').removeClass('lang-btn_active')
			.filter('[data-lang="' + lang + '"]').addClass('lang-btn_active');
	}

	// Init language from localStorage or browser
	var savedLang = null;
	try {
		savedLang = window.localStorage ? localStorage.getItem('siteLang') : null;
	} catch (e) {}

	var browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
	var initialLang = savedLang || (browserLang.indexOf('ru') === 0 ? 'ru' : 'en');

	applyTranslations(initialLang);

	// Switch language on click
	$('.lang-btn').on('click', function () {
		var lang = $(this).data('lang');
		if (!lang || !(lang in translations)) return;
		applyTranslations(lang);
		try {
			if (window.localStorage) {
				localStorage.setItem('siteLang', lang);
			}
		} catch (e) {}
	});
});
})(jQuery);