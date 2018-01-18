// ------------------------------------------------------------------------------------------------------------------------------------
// - Plugin jQuery
// ------------------------------------------------------------------------------------------------------------------------------------
	
$.fn.toggleText = function(text) {
	return this.each(function ($t) {
		var $t = $(this),
		    pieces = text.split(' '),
		    t = $t.text() == pieces[0] ? pieces[1] : pieces[0];
		$t.text(t);
	});
}

String.prototype.ucfirst = function() {
    return this.charAt(0).toUpperCase() + this.substring(1, this.length);
}						



// ------------------------------------------------------------------------------------------------------------------------------------
// - Fonctions de contrôles JSON
// ------------------------------------------------------------------------------------------------------------------------------------

// - Définit si un fichier est de type json/object
function isJSON(item) {
    item = typeof item !== "string"
        ? JSON.stringify(item)
        : item;
    try {
        item = JSON.parse(item);
    } catch (e) {
        return false;
    }
    if (typeof item === "object" && item !== null) {
        return true;
    }
    return false;
}

var managerObject;

$(function() {

	// ------------------------------------------------------------------------------------------------------------------------------------
	// - Objects jQuery
	// ------------------------------------------------------------------------------------------------------------------------------------
	
	var $body = $('body'),
		$timer = $('#timer'),
		$text = $('#text'),
		$flip = $('#flip'),
		$toggle = $('#toggle'),
		$backMenu = $('#backMenu'),
		$overlay = $('#overlay'),
		$exercise = $('#exercise'),
		$exercisesList = $('#exercisesList'),
		$exercisesCount = $('#exercisesCount'),
		$exercisesListWrapper = $exercisesList.children('div'),
		$menu = $('#menu'),
		$menuWrapper = $menu.children('div').children('div'),
		$exerciseTitle = $('#exerciseTitle'),
		$series = $('#series'),
		$audioPrev = $('#play_list_prev'),
		$audioNext = $('#play_list_next'),
		$audioToggle = $('#play_list_toggle'),
		$audioSound = $('#play_list_mute'),
		$audioToggleShow = $('#play_list_toggle_show'),
		$playAudioControl = $('#audio_control');

	// ------------------------------------------------------------------------------------------------------------------------------------
	// - Données
	// ------------------------------------------------------------------------------------------------------------------------------------
		
	/*
	// beginTime: 15,
	// defaultNextExerciseTime: 30,
	// defaultBetweenSeriesTime: 30,
	// defaultExerciseTime: 60,
	// defaultRepetitions: 3,
	...
	{
		name: "brasss",
		beginTime: 3,
		betweenSeriesTime: 5,
		nextExerciseTime: 100,
		repetitions: 2
		exercises: [
			{
				betweenSeriesTime: 1
				nextExerciseTime: 12,
				exerciseTime: 3,
				repetitions: 1,
				name: "Escaladess"
			},
		]
	}

	Il est possible de régler les options à 2 ou 3 niveaux (général, au niveau du pack ou au niveau de l'exercice)

	 */

	// var data = {
	// 	defaultBeginTime: 3,
	// 	defaultNextExerciseTime: 3,
	// 	defaultBetweenSeriesTime: 3,
	// 	defaultExercisesTime: 3,
	// 	defaultRepetitions: 2,
	// 	packs: [
	// 		{
	// 			name: "Workout",
	// 			exercises: [
	// 				{
	// 					name: "Escalade",
	// 					description: "My description",
	// 					img: 'src'
	// 				},
	// 				{
	// 					name: "Planche",
	// 				},
	// 				{
	// 					name: "40x pompes",
	// 				},
	// 				{
	// 					name: "Abdos",
	// 				},
	// 				{
	// 					name: "Burpees",
	// 				}
	// 			]
	// 		},
	// 		{
	// 			name: "Bras",
	// 			repetitions: 2,
	// 			beginTime: 2,
	// 			exercisesTime: 10,
	// 			exercises: [
	// 				{
	// 					name: "Escaladess",
	// 					repetitions: 10,
	// 					exerciseTime: 1000
	// 				},
	// 				{
	// 					name: "lop"
	// 				}
	// 			]
	// 		}
	// 	]
	// };

	// ------------------------------------------------------------------------------------------------------------------------------------
	// - PlayList & audio
	// ------------------------------------------------------------------------------------------------------------------------------------
		
	var playList=function(player, folder, urls) {
		this.player = player;
		this.folder = folder;
		this.urls = urls;

		this.$player = $(player);

		this.playList = {};
		this.playListIndex = 0;
		this.maxPlayList = 0;
		this.playListPause = false;

		this.init();
	}

	playList.prototype= {
		init:function(){
			var self = this;

			$.ajax({
			    async: true,
			    type: 'POST',
			    //data: data,
			    url: 'http://localhost:81/workout/playlist.php',
			    success: function(data) {
			        self.playList = $.parseJSON(data);
			        if (typeof urls !== typeof undefined) {
			        for (var i = 0; i < self.urls.length; i++) {
				        	var url = "@" + self.urls[i];
				        	self.playList.push(url);
				        };
				    }
			        self.maxPlayList = self.playList.length;
			    },
			});

			self.$player[0].addEventListener('ended', function(e) {
				self.playNextSong();
			});
		},

		stop:function() {
			this.$player[0].pause();
			this.$player[0].currentTime = 0;
		},

		pause:function() {
			this.$player[0].pause();
		},

		play:function() {
			this.$player[0].play();
		},

		getUri:function() {
			var self = this;
		    var uri = self.playList[self.playListIndex][0] == '@' ? self.playList[self.playListIndex] : self.folder + self.playList[self.playListIndex];
		    return uri.replace('@', '');
		},

		playPrevSong:function() {
			var self = this;

			self.playListPause = false;

			var newIndex = self.playListIndex - 1;

		    if (newIndex < 0) {
		    	self.playListIndex = self.maxPlayList - 1;
		    } else {
		    	self.playListIndex--;
		    }

		    console.log(self.playListIndex);

		    var uri = self.getUri();
		    self.setCurrentSongName();

	    	self.$player.attr('src', uri);
	    	self.$player[0].load();
	    	self.$player[0].play();
		},

		playNextSong :function() {
			var self = this;

			self.playListPause = false;
			self.playListIndex++;

		    if (self.playListIndex >= self.maxPlayList) {
		    	self.playListIndex = 0;
		    }

		    var uri = self.getUri();
		    self.setCurrentSongName();

	    	self.$player.attr('src', uri);
	    	self.$player[0].load();
	    	self.$player[0].play();
		},

		playListToggle:function(force) {
			var self = this;
			if (self.playListPause) {
				self.playListPause = false;
				if (self.$player[0].currentTime > 0 || force) {
					self.play();
				}
			} else {
				self.playListPause = true;
				if (self.$player[0].currentTime > 0 || force) {
					self.pause();
				}
			}
		},

		setCurrentSongName: function() {
			var self = this;
			var name = '';
			if (self.playList[self.playListIndex][0] == '@') {
				name = self.playList[self.playListIndex];
			} else {
				name = self.playList[self.playListIndex].substr(0, self.playList[self.playListIndex].length - 4);
			}
			$('#play_list_name').text(name);
		},

		toggleMute:function() {
			this.$player[0].muted = !this.$player[0].muted;
		},

		isPlaying:function() {
			return this.$player[0].currentTime > 0;
		},

		isPaused:function() {
			return this.$player[0].paused;
		}
	}
	playList.prototype.constructor = playList;
	var playListObject = new playList('#audio', 'webroot/sounds/playlist/');	

	// - Son pour le décompte
	var countDownSound = new Audio("webroot/sounds/countdown.ogg");
	countDownSound.addEventListener('ended', function(e) {
		countDownSound.currentTime = 0;
	});

	// ------------------------------------------------------------------------------------------------------------------------------------
	// - Manager d'exercice
	// ------------------------------------------------------------------------------------------------------------------------------------
		
	var manager=function(data) {

		this.data = data;
		this.CurrentExercise = 0;
		this.CurrentLoop = 0;
		this.NbLoop = 0;
		this.IsWaitingTime = true;
		this.timeObject = null;
		this.CurrentPackIndex = 0;

		this.defaultData = {
			defaultBeginTime: 15,
			defaultNextExerciseTime: 30,
			defaultBetweenSeriesTime: 30,
			defaultExercisesTime: 60,
			defaultRepetitions: 3,
		};

		// console.log(data);

	  //   this.data = $.extend(data, {
		 //    defaultBeginTime: 15,
			// defaultNextExerciseTime: 30,
			// defaultBetweenSeriesTime: 30,
			// defaultExerciseTime: 60,
			// defaultRepetitions: 3,

		 // //    defaultBeginTime: 4,
			// // defaultNextExerciseTime: 4,
			// // defaultBetweenSeriesTime: 4,
			// // defaultExerciseTime: 4,
			// // defaultRepetitions: 2,

	  //   }, data);

		if (typeof data === typeof undefined) {
			this.data = this.defaultData;
		}

	    // console.log(this.data);

	    this.isRunning = false;

	    this.$templateInputNumber;

		this.init();
	}

	manager.prototype= {

		init:function(){
			var self = this;

			// - searching for data
			var localData = localStorage.workoutManager;

			// console.log(localData);

			if (typeof localData !== typeof undefined) {
				this.data = JSON.parse(localData);
			}

			console.log(this.data);

			self.$templateInputNumber = $('<div class="form-row hide-in-work"><label></label><input type="number" min="0" step="1" class="save-control"></div>');
			self.$templateInput = $('<div class="form-row hide-in-work"><label></label><input type="text" class="save-control"></div>');

			self.updateMenuPacksList();
		},

		// ------------------------------------------------------------------------------------------------------------------------------------
		// - Données
		// ------------------------------------------------------------------------------------------------------------------------------------
			
		// - Contrôle que le fichier soit adapté au manager
		isValidFile:function(json) {
			if (!isJSON(json)) return false;
			var is_ok = true; 
			$.each(managerObject.defaultData, function(key, val) {
				if (json.indexOf(key) == -1) {
					is_ok = false;
					return false;
				}
			});
			return is_ok;
		},

		saveLocalData: function() {
			var self = this;
			// console.log(self.data);
			localStorage.workoutManager = JSON.stringify(self.data);
		},

		getJSONData:function() {
			return JSON.stringify(this.data);
		},

		// - Remise à 0 des données
		resetData:function() {
			localStorage.workoutManager = JSON.stringify(this.defaultData);
			this.destroyPackList();
		},

		// ------------------------------------------------------------------------------------------------------------------------------------
		// - Actions principales
		// ------------------------------------------------------------------------------------------------------------------------------------
			
		// - L'utilsateur souhaite quitter avant la fin de l'entraînement, pas bien!
		destroy: function() {
			this.stop();
			this.reset();
			$toggle.removeClass('restart');
			playListObject.stop();
			countDownSound.pause();
			countDownSound.currentTime = 0;
		},

		// - Remise à l'état du début
		reset:function() {
			var self = this;
			self.CurrentExercise = 0;
			self.CurrentLoop = 0;
			self.NbLoop = null;
			self.IsWaitingTime = true;
			$toggle.text('Commencer');
			$body.removeClass('in-work working').addClass('waiting');
			$timer.text(self.getExercisesBeginTime());
			$text.text('Préparez-vous!');
			self.initPack();
		},

		// - L'entrainement est terminée, bien!
		stop:function() {
			var self = this;
			$text.text('Bravo entraînement terminé!');
			self.timeObject.stop();
			self.timeObject = null;
			$series.empty()
			$toggle.addClass('restart').text('Recommencer');
			$exercisesListWrapper.empty();
			self.isRunning = false;
		},

		// ------------------------------------------------------------------------------------------------------------------------------------
		// - Gestion des packs d'exercices
		// ------------------------------------------------------------------------------------------------------------------------------------
			
		// - Création des données pour le pack
		initPack:function(is_new) {
			var self = this,
				pack = is_new ? {} : self.data.packs[self.CurrentPackIndex];
			$exercisesList.addClass('list');
			$exercisesListWrapper.empty();

			console.log(pack);

			// - Titre du pack
			if (!is_new) {
				$exerciseTitle.show().text(pack.name.ucfirst());
			} else {
				// - Création d'un nouveau pack d'exercices
				self.CurrentPackIndex = self.data.packs.length;
				self.data.packs[self.CurrentPackIndex] = {
					name: 'New Pack',
					exercises: []
				};
				$exerciseTitle.text('').show().editable('input', 'pack');

				// - Mise à jour du menu
				var s = setTimeout(function() {
					self.updateMenuPacksList();
					clearTimeout(s);
				}, 1000);
				
			}

			// var plur = pack['exercises'].length > 1 ? 's' : '';
			// $exerciseTitle.show().text(pack.name + " - (" + pack['exercises'].length + " exercice" + plur + ")");

			// - On ajoute les données générales du pack
			
			// name: "brasss",
			// beginTime: 3,
			// betweenSeriesTime: 5,
			// nextExerciseTime: 100,
			// repetitions: 2
			// 

			// self.data.packs[self.CurrentPackIndex]
			
			$exercisesListWrapper.append(self.createField('number', 'BeginTime', 2, 'beginTime', pack.beginTime));
			$exercisesListWrapper.append(self.createField('number', 'ExercisesTime', 2, 'exercisesTime', pack.exercisesTime));
			$exercisesListWrapper.append(self.createField('number', 'Repetitions', 2, 'repetitions', pack.repetitions));
			$exercisesListWrapper.append(self.createField('number', 'BetweenSeriesTime', 2, 'betweenSeriesTime', pack.betweenSeriesTime));
			$exercisesListWrapper.append(self.createField('number', 'NextExerciseTime', 2, 'nextExerciseTime', pack.nextExerciseTime));

			if (is_new) return;

			for (var i = 0; i < self.data.packs[self.CurrentPackIndex]['exercises'].length; i++) {

				var $item = self.createExercise(i, true);

				$exercisesListWrapper.append($item);

			};
		},

		deletePack:function(index) {
			var self = this;
			index = typeof index === typeof undefined ? self.CurrentPackIndex : index;
			self.data.packs[index] = null;

			packs = [];

			for (var i = 0; i < self.data.packs.length; i++) {
				var pack = self.data.packs[i];
				if (pack !== null) {
					packs[i] = pack;
				}
			};

			self.data.packs = packs;
			self.saveLocalData();
			self.updateMenuPacksList();
			$flip.removeClass('active');
		},

		// - Permet de proposer l'ensemble des pack d'entrainement aux utilisateurs
		updateMenuPacksList:function() {
			var self = this;

			self.destroyPackList();
	
			if (typeof self.data.packs !== typeof undefined) {
				for (var i = 0; i < self.data.packs.length; i++) {
					var pack = self.data.packs[i];
					$menuWrapper.append('<div class="exercise-pack" data-index="' + i + '"><div class="verticalMiddle"><span>' + pack.name + '</span></div></div>');
				};
			}
			$menuWrapper.append('<div class="exercise-pack"><div class="verticalMiddle"><span class="icon-plus"></span></div></div>');
		},

		destroyPackList:function() {
			$menuWrapper.empty();
		},

		// ------------------------------------------------------------------------------------------------------------------------------------
		// - Gestion des exercices
		// ------------------------------------------------------------------------------------------------------------------------------------
			
		loadExercise:function(index) {
			var self = this;

			// - On charge un pack existant
			if (typeof self.data.packs[index] !== typeof undefined) {
				self.CurrentPackIndex = index;
				self.initPack();
			} 
			// - Création d'un nouveau pack
			else {
				self.initPack(true);
			}
		},

		// - Création au niveau HTML d'un exercice
		createExercise:function(index, exists) {

			console.log('pack index: ' + this.CurrentPackIndex);
			console.log('index: ' + index);
			console.log('exists: ' + exists);

			var self = this;
			var exercise;
			if (!exists) {

				console.log('not exists');

				exercise = {
					name: "Exercice " + (index + 1)
				};
				self.data.packs[self.CurrentPackIndex]['exercises'][index] = exercise;
			} else {
				exercise = self.data.packs[self.CurrentPackIndex]['exercises'][index];
			}

			console.log(self.data);

			var $item = $('<div class="exercise-item" data-exercise="' + index + '"></div>');

			var $del = $('<span class="delete-exercise icon-cancel-circle abs-tr pointer hide-in-work sm-opacity-h"></span>');
			$item.append($del);

			var $title = $('<h3 class="editable-input" data-name="name" data-type="exercise">' + exercise.name + '</h3>');
			$item.append($title);
			
			var has_description = typeof exercise.description !== typeof undefined;
			var has_img = typeof exercise.img !== typeof undefined;
			var html = '';
			if (has_description || has_img) {
				
				var html = '';

				if (has_img) {
					html += '<img src="a.jpg" alt="exercise-img">';
				}

				if (has_description) {
					html += '<p>' + exercise.description + '</p>';
				}

				$item.append($('<div class="exercise-details">' + html + '</div>'));
			}

			if (html != '') {
				$item.addClass('has-details');
			}

			$item.append(self.createField('number', 'ExercisesTime', 3, 'exercisesTime', exercise.exerciseTime));
			$item.append(self.createField('number', 'Repetitions', 3, 'repetitions', exercise.repetitions));
			$item.append(self.createField('number', 'BetweenSeriesTime', 3, 'betweenSeriesTime', exercise.betweenSeriesTime));
			$item.append(self.createField('number', 'NextExerciseTime', 3, 'nextExerciseTime', exercise.nextExerciseTime));

			return $item;	
		},

		// - Création d'un nouvel exercice
		addExercise:function() {
			var self = this;
			var index = self.data.packs[self.CurrentPackIndex]['exercises'].length;
			console.log(index);

			// - Il s'agit du premier exercice du pack
			if (typeof index === typeof undefined) {
				index = 0;
			}

			var $item = self.createExercise(index, false);

			$exercisesListWrapper.append($item);
			$exercisesList.animate({
				scrollTop: +$exercisesList.height() + 200
			}, 300);

			$item.find('[data-name="name"]').editable();
		},

		deleteExercise:function(index) {
			var self = this;
			$body.find('.exercise-item').filter('[data-exercise="' + index + '"]').remove();
			var exercises = [];
			var i = 0;
			// - Suppression de l'entrée dans les data
			$.each(self.data.packs[self.CurrentPackIndex]['exercises'], function(key, exercise) {
				if (key != index) {
					exercises.push(exercise);
				}
				i++;
			});
			self.data.packs[self.CurrentPackIndex]['exercises'] = exercises;
			self.saveLocalData();
		},

		// - Définit le nombre de séries sous forme visuel (rond) si la série est effectuée ou en cours le rond est rempli
		setSeries:function() {
			var self = this;
			$series.empty();
			for (var i = 0; i < self.getNbLoopOfExercise(0); i++) {
				$series.append($('<span></span>'));
			};
		},

		// - La List est en fait la liste des exercice d'un pack
		updateList:function() {
			var self = this;
			$exercisesList.removeClass('list');
			$exercisesListWrapper.children().removeClass('active next fore-next spring');
			$exercisesListWrapper.children('[data-exercise="' + self.CurrentExercise + '"]').addClass('active spring');
			$exercisesListWrapper.children('[data-exercise="' + (self.CurrentExercise + 1) + '"]').addClass('next');
			$exercisesListWrapper.children('[data-exercise="' + (self.CurrentExercise + 2) + '"]').addClass('fore-next');
		},

		// ------------------------------------------------------------------------------------------------------------------------------------
		// - Gestion des champs de données
		// ------------------------------------------------------------------------------------------------------------------------------------
			
		/* jsonRef est la référence nominal du parent (cela permet de ne pas avoir de problème avec les singulier et pluriel comme exercise(s)Time) */
		createField:function(type, labelName, level, jsonRef, val) {
			var self = this;
			var $row;
			switch (type) {
				case 'number':
					$row = self.$templateInputNumber.clone();
					break;
				default:
					$row = self.$templateInput.clone();
					break;
			}
			$row.children('label').text(labelName);
			var $input = $row.children('input');
			$input.attr('name', jsonRef).attr('data-level', level);

			// - Définit la valeur du champs en fonction de son niveau
			var v = self.data['default' + jsonRef.ucfirst()];
			var linked = false;
			if (typeof val === typeof undefined || val === null) {
				// - Est-ce qu'il y une option de définie pour le pack?
				if (level == 3) {
					if (typeof self.data.packs[self.CurrentPackIndex][jsonRef] !== typeof undefined) {
						v = self.data.packs[self.CurrentPackIndex][jsonRef];
					}
				}
				linked = true;
			} else {
				v = val;
			}

			// - Permet de mettre à jour les éléments qui n'ont pas été modifiés par l'utilisateur lors de changement dans les data du pack
			$input.val(v).attr('data-linked', linked).on('change focusout', function() {
				if (level == 3) {
					// - Si la valeur est la même que cel du pack on "relink" les éléments
					if (+$body.find('.save-control').filter('[data-level="2"]').filter('[name="' + jsonRef + '"]').val() == +$input.val()) {
						$input.attr('data-linked', true);
					} 
					// - Dans le cas contraire on brise le liens afin de ne pas écraser les données entrées par l'utilisateur
					else {
						$input.attr('data-linked', false);
					}
				} else if (level == 2) {
					$body.find('.save-control').filter('[data-level="3"]').filter('[data-linked="true"]').filter('[name="' + jsonRef + '"]').each(function() {
						$(this).val($input.val());
					});
				}
			});

			return $row;
		},

		// - Enregistrement des modifications apportées par l'utilisateurs
		saveFields:function() {
			var self = this,
				pack = self.data.packs[self.CurrentPackIndex];

			$body.find('.save-control').each(function(key, val) {

				var $input = $(this);

				// - Mise à jour des datas
				var level = $input.attr('data-level');
				var jsonRef = $input.attr('name');
				var val = $input.val();

				// console.log(level);
				// console.log(jsonRef);
				// console.log(val);
				// console.log('-----');

				var default_val = self.data['default' + jsonRef.ucfirst()];

				if (level == 3) {
					// - Si la valeur n'est pas la même que le parent et la valeur par défaut on l'ignore
					var parent_val = self.data.packs[self.CurrentPackIndex][jsonRef];

					// console.log(jsonRef);
					// console.log('val: ' + val);
					// console.log('parent val: ' + parent_val);
					// console.log('default val: ' + default_val);

					if (parent_val != val && default_val != val) {
						var ref = jsonRef;
						if (jsonRef == 'exercisesTime') {
							ref = 'exerciseTime';
						}
						self.data.packs[self.CurrentPackIndex]['exercises'][self.CurrentExercise][ref] = parseInt(val);
					}

				}

				// - Si la valeur n'est pas la même que le parent on l'ignore
				else if (level == 2) {
					if (default_val != val) {
						self.data.packs[self.CurrentPackIndex][jsonRef] = parseInt(val);
					}
				}
			});

			console.log(self.data.packs[self.CurrentPackIndex]);

			self.saveLocalData();
		},

		updateField:function(index_exercise, ref, value, type) {
			var self = this;
			switch(type) {	
				case 'exercise':
					self.data.packs[self.CurrentPackIndex]['exercises'][index_exercise][ref] = value;
					break;
				case 'pack':
					self.data.packs[self.CurrentPackIndex][ref] = value;
					
					// - Mettre à jour du nom dans le menu
					if (ref == 'name') {
						$body.find('.exercise-pack').filter('[data-index="' + self.CurrentPackIndex + '"]').find('span').text(value);
					}

					break;
				case 'manager':
					self.data[ref] = value;
			}
			self.saveLocalData();
		},

		// ------------------------------------------------------------------------------------------------------------------------------------
		// - Gestion du processus d'entrainement
		// ------------------------------------------------------------------------------------------------------------------------------------
			
		// - Regroupe toutes les méthodes de mise à jour de l'interface utilisateur
		updateUI:function() {
			var self = this;
			self.setSeries();
			self.updateList();
			self.updateExercisesCout();
		},

		// - Mise à jour du décompte d'exercices effectués
		updateExercisesCout:function() {
			var self = this;
			$exercisesCount.text((self.CurrentExercise + 1) + " / " + self.data.packs[self.CurrentPackIndex]['exercises'].length);
		},

		getNbLoopOfExercise:function(index) {
			var self = this;
			if (typeof self.data.packs[self.CurrentPackIndex]['exercises'][index].repetitions == 'number') {
				return self.data.packs[self.CurrentPackIndex]['exercises'][index].repetitions;
			} else if (typeof self.data.packs[self.CurrentPackIndex].repetitions == 'number') {
				return self.data.packs[self.CurrentPackIndex].repetitions;
			} else {
				return self.data.defaultRepetitions;
			}
		},

		getExercisesBeginTime:function() {
			var self = this;
			console.log(typeof self.data.packs[self.CurrentPackIndex].beginTime);
			return typeof self.data.packs[self.CurrentPackIndex].beginTime == 'number' ? self.data.packs[this.CurrentPackIndex].beginTime : self.data.defaultBeginTime;
		},

		getBetweenSeriesTime:function() {
			var self = this;
			if (typeof self.data.packs[self.CurrentPackIndex]['exercises'][self.CurrentExercise].betweenSeriesTime == 'number') {
				return self.data.packs[self.CurrentPackIndex]['exercises'][self.CurrentExercise].betweenSeriesTime;
			} else if (typeof self.data.packs[self.CurrentPackIndex].betweenSeriesTime == 'number') {
				return self.data.packs[self.CurrentPackIndex].betweenSeriesTime;
			} else{
				return self.data.defaultBetweenSeriesTime;
			}
		},

		getNextExerciseTime:function() {
			var self = this;
			if (typeof self.data.packs[self.CurrentPackIndex]['exercises'][self.CurrentExercise].nextExerciseTime == 'number') {
				return self.data.packs[self.CurrentPackIndex]['exercises'][self.CurrentExercise].nextExerciseTime;
			} else if (typeof self.data.packs[self.CurrentPackIndex].nextExerciseTime == 'number') {
				return self.data.packs[self.CurrentPackIndex].nextExerciseTime;
			} else {
				return self.data.defaultNextExerciseTime;
			}
		},

		getExerciseTime:function() {
			var self = this;
			if (typeof self.data.packs[self.CurrentPackIndex]['exercises'][self.CurrentExercise].exerciseTime == 'number') {
				return self.data.packs[self.CurrentPackIndex]['exercises'][self.CurrentExercise].exerciseTime;
			} else if (typeof self.data.packs[self.CurrentPackIndex].exercisesTime == 'number') {
				return self.data.packs[self.CurrentPackIndex].exercisesTime;
			} else {
				return self.data.defaultExercisesTime;
			}
		},

		// - Définit le temps de la prochaine étape
		setStepTime:function(type) {
			var t = 0,
				self = this;
			switch(type) {
				case 'exercise':
					t = self.getExerciseTime();
					break;

				case 'betweenSeries':
					t = self.getBetweenSeriesTime();
					break;

				case 'begin':
					t = self.getExercisesBeginTime();
					break;
			}

			console.log(type + ' ' + t);

			if (t == 0) {
				self.next();
				return false;
			}

			self.timeObject = new chrono(t);
			return true;
		},

		// - L'utlisateur passe à l'étape suivante
		nextFromPlayer:function() {
			this.timeObject.stop();
			this.next();
		},

		// - Une fois le temps écoulé cette méthode ce gère d'appler la suite des exercices ou des temps de repos
		next:function(first) {

			var self = this;

			var exercise = self.data.packs[this.CurrentPackIndex]['exercises'][self.CurrentExercise];

			if (first) {
				self.reset();
				self.updateUI();
				self.isRunning = true;
				$exerciseTitle.hide();
				$playAudioControl.addClass('active');
				$audioToggleShow.addClass('active');
				$backMenu.toggleClass('icon-circle-left icon-cancel-circle');

				self.setStepTime('begin');

				// var t = self.getExercisesBeginTime();
				// if (t == 0) {
				// 	self.next();
				// }
				// self.timeObject = new chrono(t);

				return;
			}

			$body.removeClass('working waiting');

			if (typeof exercise === typeof undefined) {
				self.stop();
				return false;
			}

			// - Définit le nombre de répétitions de l'exercise pour le premier
			if (self.NbLoop == null) {
				self.NbLoop = self.getNbLoopOfExercise(self.CurrentExercise);
			}

			// - Il s'agit de la fin d'un entre temps
			if (self.IsWaitingTime) {
				$series.children('span').filter(':eq(' + self.CurrentLoop + ')').addClass('active');
				self.CurrentLoop++;
			}

			// - On enlève les classes d'animation
			if ($timer.hasClass('spring-3')) {
				$timer.removeClass('spring-3');
			}

			// - L'exercise est terminée on passe au suivant
			if (self.CurrentLoop > self.NbLoop) {
				self.nextExercise();
			} 
			// - On commence la série de l'exercise en cours
			else if (self.IsWaitingTime) {
				self.playExercise(exercise);
			} 
			// - Il est temps de faire une petie pause
			else {
				self.waitingTime(exercise);
			}
		},

		// - Un temps de repos est requis après l'entrainement
		waitingTime:function(exercise) {
			var self = this;
			self.IsWaitingTime = true;

			if (self.CurrentLoop + 1 > self.NbLoop) {
				self.nextExercise();
				return;
			}

			$body.addClass('waiting');
			$text.text('Repos');

			if (!self.setStepTime('betweenSeries')) {
				return false;
			}

			// var t = self.getBetweenSeriesTime();

			// if (t == 0) {
			// 	self.next();
			// 	return false;
			// }

			// self.timeObject = new chrono(t); 
		},

		// - Un exercice commence
		playExercise:function(exercise) {

			var self = this;
			$text.html('Faire l\'exercise');
			$body.addClass('working');

			self.updateList();

			self.IsWaitingTime = false;

			if (!self.setStepTime('exercise')) {
				return false;
			}

			// var t = self.getExerciseTime();

			// if (t == 0) {
			// 	self.next();
			// 	return false;
			// }

			// self.timeObject = new chrono(t);
		},

		nextExerciseFromPlayer:function() {
			this.timeObject.stop();
			this.nextExercise();
		},

		// - On se prépare à l'exercice suivant
		nextExercise:function() {
			var self = this;

			self.IsWaitingTime = true;
			var t = self.getNextExerciseTime();

			self.CurrentLoop = 0;
			self.CurrentExercise++;

			// - On regarde s'il y a encore des exercices
			if (typeof self.data.packs[self.CurrentPackIndex]['exercises'][self.CurrentExercise] == typeof undefined) {
				self.stop();
				$body.addClass('waiting');
				return;
			}

			self.updateUI();

			// - Définit le nombre de répétitions de l'exercice
			self.NbLoop = self.getNbLoopOfExercise(self.CurrentExercise);
			$series.empty();
			for (var i = 0; i < self.NbLoop; i++) {
				$series.append($('<span></span>'));
			};

			$text.text('Repos');
			$body.addClass('waiting');

			if (t == 0) {
				self.next();
				return false;
			}

			self.timeObject = new chrono(t);
		}
	}
	manager.prototype.constructor = manager;

	// ------------------------------------------------------------------------------------------------------------------------------------
	// - Gestionnaire du temps
	// ------------------------------------------------------------------------------------------------------------------------------------

	var chrono=function(time) {
		this.time = time;
		this.elapsedTime;
		this.chronoRef;
		this.isrunning = false;
		this.isfinish = false;
		this.beforePauseClass = '';

		this.init();
	}
	chrono.prototype= {
		init:function() {
			var self = this;
			self.elapsedTime = self.time;
			$timer.text(self.time);
			self.play();
		},
		count: function() {
			var self = this;

			if (!self.isrunning) return;

			self.elapsedTime--;

			if (self.elapsedTime == 3) {

				console.log('play sound');

				$timer.addClass('spring-3');

				countDownSound.remove();
				countDownSound.play();
			}

			$timer.text(self.elapsedTime);

			if (self.elapsedTime == 0) {
				self.end();
				return;
			}

			self.chronoRef = setTimeout(function(){
				if (!self.isrunning) return;
				self.count();
			}, 1000);

			//console.log(self.elapsedTime);
		},
		toggle: function() {
			var self = this;
			if (self.isrunning) {
				self.pause();

			} else {
				self.play();
			}
		},
		play: function() {
			var self = this;
			self.isrunning = true;
			self.chronoRef = setTimeout(function(){self.count();}, 1000);
		},
		stop: function() {
			this.pause();
			this.elapsedTime = 0;
			this.isfinish = true;
		},
		pause: function() {
			this.isrunning = false;
			clearTimeout(this.chronoRef);
		},
		end: function() {
			managerObject.next();
			this.stop();
		}
	}
	chrono.prototype.constructor = chrono;

	var pause = false;						// - Est-ce que l'utilisateur a mis pause
	var wasMusicON = false;					// - Définit comment le lecteur doit se comporter lors de la pause et sa reprise
	managerObject = new manager();

	// ------------------------------------------------------------------------------------------------------------------------------------
	// - Événements et actions
	// ------------------------------------------------------------------------------------------------------------------------------------
		
	var toggleTraining = function(minimal) {

		if (pause) {

			if (countDownSound.currentTime > 0) {
				countDownSound.play();
			}

			if (!wasMusicON) {
				playListObject.playListToggle();
				$audioToggle.toggleClass('icon-pause icon-play');
			}

			pause = false;

		} else{

			wasMusicON = playListObject.isPaused();

			if (countDownSound.currentTime > 0) {
				countDownSound.pause();
			}

			if (!wasMusicON) {
				playListObject.playListToggle();
				$audioToggle.toggleClass('icon-pause icon-play');
			}

			pause = true;
		}

		managerObject.timeObject.toggle();

		if (minimal) return;

		$overlay.toggleClass('active');
		$toggle.toggleClass('menu').toggleText('Pause Reprendre');
	}

	$toggle.on('click', function() {

		if ($(this).hasClass('restart')) {
			$(this).removeClass('restart');

			$body.removeClass('in-work');

			var s = setTimeout(function() {
				managerObject.reset();
				clearTimeout(s);
			}, 500);
			
			return;
		}

		// - On lance l'entrainement
		if (!$body.hasClass('in-work')) {

			// - Avant de commencer il faut sauvegarder toutes les données modifiées lors des réglages d'avant entrainement
			managerObject.saveFields();

			managerObject.next(true);

			if (!playListObject.isPlaying()) {
				playListObject.playNextSong();
			}

			$(this).text('Pause');
			$body.addClass('in-work');

		}
		// - Pause ou reprise durant l'entrainement
		else {
			toggleTraining();
		}
	});

	$backMenu.on('click', function() {

		var back = function() {
			$flip.toggleClass('active');
			$playAudioControl.removeClass('active');
			$audioToggleShow.removeClass('active');
		};

		if (managerObject.isRunning) {
			toggleTraining(true);
			modalObject.open(function(){
				$overlay.removeClass('active');
				managerObject.destroy();
				$backMenu.toggleClass('icon-circle-left icon-cancel-circle');
				back();
			}, 'confirm', 'Arrêter l\'entrainement?', 'Souhaitez-vous vraiment abandonner votre entrainement?', null, null, function() {
				toggleTraining(true);
			});
		} else {
			back();
		}
	});

	$menu.on('click', '.exercise-pack', function() {
		$flip.toggleClass('active');
		managerObject.loadExercise(+$(this).attr('data-index'));
	});

	// - Gestion du son et de la playlist
	$audioPrev.on('click', function() {
		$audioToggle.addClass('icon-pause').removeClass('icon-play');
		playListObject.playPrevSong();
		wasMusicON = true;
	});

	$audioNext.on('click', function() {
		$audioToggle.addClass('icon-pause').removeClass('icon-play');
		playListObject.playNextSong();
		wasMusicON = true;
	});

	$audioToggle.on('click', function() {
		$(this).toggleClass('icon-pause icon-play');
		playListObject.playListToggle(true);
	});

	$audioSound.on('click', function() {
		playListObject.toggleMute();
		countDownSound.muted = !countDownSound.muted;
		$(this).toggleClass('icon-volume icon-volume-mute');
	});

	$body.on('click', '.has-details', function() {
		var $t = $(this);
		if ($t.hasClass('next') || $t.hasClass('fore-next')) return;
		var $details = $t.find('.exercise-details');
		if ($t.hasClass('active')) {
			$details.toggleClass('working-details');
			$details.toggle();
			$body.find('.exercise-item').filter('.next').toggle();
			$body.find('.fore-next').filter('.fore-next').toggle();
		} else {
			$details.toggle();
		}
		$details.closest('.exercise-item').toggleClass('details-active');
	});

	$audioToggleShow.on('click', function() {
		$playAudioControl.toggleClass('active');
		$(this).toggleClass('active icon-circle-up icon-circle-down');
	});

	function elementAnimation($element, type) {

		var c = '';

		switch(type) {
			case 'error':

				c = 'error';

				break;

			case 'info':

				c = 'info';

				break;

			default:

				c = 'success';

				break;
		}

		$element.addClass('active ' + c);

		var s = setTimeout(function() {
			$element.removeClass('info error success active');
			clearTimeout(s);
		}, 3000);
	}

	// ------------------------------------------------------------------------------------------------------------------------------------
	// - Gestion des données utilisateurs
	// ------------------------------------------------------------------------------------------------------------------------------------
		
	// - Téléchargement de la configuration en local (par l'utilisateur)
	var $download = $('#download'),
		$downloadIcon = $download.children('span'),
		$upload = $('#upload'),
		$uploadIcon = $upload.children('span'),
		$uploadInput = $('#upload_input'),
		$resetData = $('#reset_data');


	$body.on('click', '.download-data', function() {
		var file = new Blob([managerObject.getJSONData()], {'text/plain': 'text/plain'});
		$(this)[0].href = URL.createObjectURL(file);
		$(this)[0].download = 'workoutManager.json';
	});

	// - Chargement et contrôle des données depuis un fichier JSON
	$uploadInput.on('change', function() {
		var fileInput = $uploadInput[0];
		var file = fileInput.files[0];
		var reader = new FileReader();
		reader.onload = function(e) {
			var content = reader.result;
			if (managerObject.isValidFile(content)) {
				localStorage.workoutManager = content;
				managerObject = new manager();
				elementAnimation($uploadIcon);
			} else {
				elementAnimation($uploadIcon, 'error');
			}
			$uploadInput.closest('form')[0].reset();
		}
		reader.readAsText(file);
	});

	$upload.on('click', function() {
		$uploadInput.trigger('click');
	});

	// - Reset des données par l'utilisateur
	$resetData.on('click', function() {
		modalObject.open(function(){
			managerObject.resetData();
			managerObject = new manager();	
		}, 'confirm', 'Remise à zéro des données', 'Cette action est irréversible');
	});

	$('#player_action_next_exercise').on('click', function() {
		managerObject.nextExerciseFromPlayer();
	});

	$('#player_action_next').on('click', function() {
		managerObject.nextFromPlayer();
	});

	// ------------------------------------------------------------------------------------------------------------------------------------
	// - Modal / Confirm
	// ------------------------------------------------------------------------------------------------------------------------------------

	var modal=function(id) {
		this.$element = $(id);
		this.$title;
		this.$content;
		this.$buttonYes;
		this.$buttonNo;

		this.callbackYes = null;

		this.is_active = false;

		this.init();

	}

	modal.prototype= {

		init:function() {

			var self = this;

			self.$title = self.$element.find('.modal-title');
			self.$content = self.$element.find('.modal-content');
			self.$buttonYes = self.$element.find('.modal-button-yes');
			self.$buttonNo = self.$element.find('.modal-button-no');
			self.$close = self.$element.find('[data-action="close"]');
			self.$wrapper = self.$element.children('.modal-wrapper');

			self.$close.on('click', function() {
				self.close();
			});

			self.$buttonYes.on('click', function() {
				if (self.callbackYes !== null)
					self.callbackYes();
				self.close();
			});

			self.$buttonNo.on('click', function() {
				if (typeof self.callbackNo == 'function')
					self.callbackNo();
				self.close();
			});

			self.$wrapper.on('click', function() {
				self.close();
			});

			$body.on('keyup', function(e) {
				if (!self.is_active) return;
				var keyCode = e.keyCode || e.which;
				if (keyCode == 27) {
					self.close();
				}
			});

		},

		open:function(callbackYes, type, title, content, buttonYes, buttonNo, callbackNo) {
			var self = this;

			self.is_active = true;

			if (typeof callbackYes == 'function') {
				self.callbackYes = callbackYes;
			}

			if (typeof callbackNo == 'function') {
				self.callbackNo = callbackNo;
			}

			if (typeof type !== typeof undefined && type !== null)
				self.$element.attr('data-type', type);

			if (typeof title !== typeof undefined)
				self.$title.text(title);

			if (typeof content !== typeof undefined)
				self.$content.text(content);

			if (typeof buttonYes !== typeof undefined && buttonYes !== null)
				self.$buttonYes.text(buttonYes);

			if (typeof buttonYes !== typeof undefined && buttonNo !== null)
				self.$buttonNo.text(buttonNo);

			self.$element.addClass('active');

		},

		close:function() {
			this.callbackYes = this.callbackNo = null;
			this.is_active = false;
			this.$element.removeClass('active');
		},

	}

	modal.prototype.constructor = modal;
	var modalObject = new modal('#modal');
	
	// ------------------------------------------------------------------------------------------------------------------------------------
	// - Editable
	// ------------------------------------------------------------------------------------------------------------------------------------
		
	$body.on('click', '#add_exercise', function() {
		managerObject.addExercise();
	});

	$body.on('click', '.delete-exercise', function() {
		if ($body.hasClass('in-work')) return;
		var index = +$(this).closest('.exercise-item').attr('data-exercise');
		managerObject.deleteExercise(index);
	});

	var $tempInput;
	var $initElement;
	var editing = false;
	var updateEdit = null;

	$.fn.editable = function(type, d_type) {
		if (typeof type === typeof undefined) {
			type = 'input';
		}
		editable($(this), type, d_type);
	}

	var editable = function($src, type, d_type) {

		if (editing) return;

		if (typeof type === typeof undefined) {
			type = 'input';
		}

		$initElement = $src;
		editing = true;
		$tempInput = $('<input>').addClass('tmp-input').css({
			padding: $initElement.css('padding'),
			marginTop: $initElement.css('margin-top'),
			marginBottom: $initElement.css('margin-bottom'),
			display: $initElement.css('display'),
			fontSize: $initElement.css('font-size'),
			textAlign: $initElement.css('text-align'),
			fontWeight: $initElement.css('font-weight'),
			lineHeight: $initElement.css('line-height'),
		}).val($initElement.text());
		$initElement.replaceWith($tempInput);
		$tempInput.focus();	

		updateEdit = function(reset) {

			var v = reset === true ? $initElement.text() : $tempInput.val();
			var jsonRef = $initElement.attr('data-name');

			if (typeof d_type === typeof undefined) {
				d_type = $initElement.attr('data-type');
			}

			var index = null;
			if (d_type == 'exercise') {
				index = +$tempInput.closest('.exercise-item').attr('data-exercise');
			}

			// - Nom par défaut si rien n'est entré
			if (v === '') {
				if (d_type == 'exercise') {
					v = 'Exercice ' + (index + 1);
				} else if ($initElement.attr('data-name') == 'name' && d_type == 'pack') {
					v = 'New Pack';
				}		
			}

			$initElement.text(v);
			$tempInput.replaceWith($initElement);

			editing = false;

			console.log('d_type: ' + d_type);

			managerObject.updateField(index, jsonRef, $initElement.text(), d_type);
		}

		$tempInput.on('focusout', function() {
			updateEdit(false);
		});

	}

	$body.on('click', '.editable-input', function() {
		$(this).editable();
	});

	$body.on('keydown', function(e) {
		if (!editing) return;
		var keyCode = e.keyCode || e.which;
		if (keyCode == 27) {
			updateEdit(true);
		} else if (keyCode == 13) {
			updateEdit(false);
		}
	});

	// ------------------------------------------------------------------------------------------------------------------------------------
	// - Delete pack
	// ------------------------------------------------------------------------------------------------------------------------------------

	$('#delete_pack').on('click', function() {
		modalObject.open(function() {
			managerObject.deletePack();	
		}, 'confirm', 'Voulez-vous vraiment supprimer ce pack?', '');
	});

});