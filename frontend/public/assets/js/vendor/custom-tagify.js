
(function ($) {
    "use strict";
    var windowOn = $(window);

    document.addEventListener('DOMContentLoaded', function () {
        // The DOM element you wish to replace with Tagify
        var input = document.querySelector('input[name=TagifyBasic]');
        // initialize Tagify on the above input node reference
        new Tagify(input)
    });

    document.addEventListener('DOMContentLoaded', function () {
        var input = document.querySelector('input[name=TagifyReadonly]'),
            tagify = new Tagify(input);
    });

    document.addEventListener('DOMContentLoaded', function () {
        var inputElm = document.querySelector('input[name=users-list-tags]');

        function tagTemplate(tagData) {
            return `
			<tag title="${tagData.email}"
					contenteditable='false'
					spellcheck='false'
					tabIndex="-1"
					class="tagify__tag ${tagData.class ? tagData.class : ""}"
					${this.getAttributes(tagData)}>
				<x title='' class='tagify__tag__removeBtn' role='button' aria-label='remove tag'></x>
				<div>
					<div class='tagify__tag__avatar-wrap'>
						<img onerror="this.style.visibility='hidden'" src="${tagData.avatar}">
					</div>
					<span class='tagify__tag-text'>${tagData.name}</span>
				</div>
			</tag>
		`
        }

        function suggestionItemTemplate(tagData) {
            return `
        <div ${this.getAttributes(tagData)}
            class='tagify__dropdown__item ${tagData.class ? tagData.class : ""}'
            tabindex="0"
            role="option">
            ${tagData.avatar ? `
                <div class='tagify__dropdown__item__avatar-wrap'>
                    <img onerror="this.style.visibility='hidden'" src="${tagData.avatar}">
                </div>` : ''
                }
            <strong>${tagData.name}</strong>
            <span>${tagData.email}</span>
        </div>
    `
        }

        function dropdownHeaderTemplate(suggestions) {
            return `
        <header data-selector='tagify-suggestions-header' class="${this.settings.classNames.dropdownItem} ${this.settings.classNames.dropdownItem}__addAll">
            <div>
                <strong>${this.value.length ? `Add Remaning` : 'Add All'}</strong>

            </div>
            <span>${suggestions.length} members</span>
        </header>
    `
        }

        // Initialize Tagify on the above input node reference
        var tagify = new Tagify(inputElm, {
            tagTextProp: 'name',
            skipInvalid: true,
            dropdown: {
                closeOnSelect: false,
                enabled: 0,
                classname: 'users-list',
                searchKeys: ['name', 'email']
            },
            templates: {
                tag: tagTemplate,
                dropdownItem: suggestionItemTemplate,
                dropdownHeader: dropdownHeaderTemplate
            },
            whitelist: [
                {
                    "value": 1,
                    "name": "Justinian Hattersley",
                    "avatar": "https://i.pravatar.cc/80?img=1",
                    "email": "jhattersley0@ucsd.edu",
                    "team": "A"
                },
                {
                    "value": 2,
                    "name": "Antons Esson",
                    "avatar": "https://i.pravatar.cc/80?img=2",
                    "email": "aesson1@ning.com",
                    "team": "B"

                },
                {
                    "value": 3,
                    "name": "Ardeen Batisse",
                    "avatar": "https://i.pravatar.cc/80?img=3",
                    "email": "abatisse2@nih.gov",
                    "team": "A"
                },
                {
                    "value": 4,
                    "name": "Graeme Yellowley",
                    "avatar": "https://i.pravatar.cc/80?img=4",
                    "email": "gyellowley3@behance.net",
                    "team": "C"
                },
                {
                    "value": 5,
                    "name": "Dido Wilford",
                    "avatar": "https://i.pravatar.cc/80?img=5",
                    "email": "dwilford4@jugem.jp",
                    "team": "A"
                },
                {
                    "value": 6,
                    "name": "Celesta Orwin",
                    "avatar": "https://i.pravatar.cc/80?img=6",
                    "email": "corwin5@meetup.com",
                    "team": "C"
                },
                {
                    "value": 7,
                    "name": "Sally Main",
                    "avatar": "https://i.pravatar.cc/80?img=7",
                    "email": "smain6@techcrunch.com",
                    "team": "A"
                },
                {
                    "value": 8,
                    "name": "Grethel Haysman",
                    "avatar": "https://i.pravatar.cc/80?img=8",
                    "email": "ghaysman7@mashable.com",
                    "team": "B"
                },
                {
                    "value": 9,
                    "name": "Marvin Mandrake",
                    "avatar": "https://i.pravatar.cc/80?img=9",
                    "email": "mmandrake8@sourceforge.net",
                    "team": "B"
                },
                {
                    "value": 10,
                    "name": "Corrie Tidey",
                    "avatar": "https://i.pravatar.cc/80?img=10",
                    "email": "ctidey9@youtube.com",
                    "team": "A"
                },
                {
                    "value": 11,
                    "name": "foo",
                    "avatar": "https://i.pravatar.cc/80?img=11",
                    "email": "foo@bar.com",
                    "team": "B"
                },
                {
                    "value": 12,
                    "name": "foo",
                    "avatar": "https://i.pravatar.cc/80?img=12",
                    "email": "foo.aaa@foo.com",
                    "team": "A"
                },
            ],
            transformTag: (tagData, originalData) => {
                var { name, email } = parseFullValue(tagData.name)
                tagData.name = name
                tagData.email = email || tagData.email
            },
            validate({ name, email }) {
                // when editing a tag, there will only be the "name" property which contains name + email (see 'transformTag' above)
                if (!email && name) {
                    var parsed = parseFullValue(name)
                    name = parsed.name
                    email = parsed.email
                }

                if (!name) return "Missing name"
                if (!validateEmail(email)) return "Invalid email"

                return true
            }
        });
        // The below code is printed as escaped, so please copy this function from:
        // https://github.com/yairEO/tagify/blob/master/src/parts/helpers.js#L89-L97
        function escapeHTML(s) {
            return typeof s == 'string' ? s
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/`|'/g, "&#039;")
                : s;

        }

        // The below part is only if you want to split the users into groups, when rendering the suggestions list dropdown:
        // (since each user also has a 'team' property)
        tagify.dropdown.createListHTML = sugegstionsList => {
            const teamsOfUsers = sugegstionsList.reduce((acc, suggestion) => {
                const team = suggestion.team || 'Not Assigned';

                if (!acc[team])
                    acc[team] = [suggestion]
                else
                    acc[team].push(suggestion)

                return acc
            }, {})

            const getUsersSuggestionsHTML = teamUsers => teamUsers.map((suggestion, idx) => {
                if (typeof suggestion == 'string' || typeof suggestion == 'number')
                    suggestion = { value: suggestion }

                var value = tagify.dropdown.getMappedValue.call(tagify, suggestion)

                suggestion.value = value && typeof value == 'string' ? escapeHTML(value) : value

                return tagify.settings.templates.dropdownItem.apply(tagify, [suggestion]);
            }).join("")


            // assign the user to a group
            return Object.entries(teamsOfUsers).map(([team, teamUsers]) => {
                return `<div class="tagify__dropdown__itemsGroup" data-title="Team ${team}:">${getUsersSuggestionsHTML(teamUsers)}</div>`
            }).join("")
        }

        // attach events listeners
        tagify.on('dropdown:select', onSelectSuggestion) // allows selecting all the suggested (whitelist) items
            .on('edit:start', onEditStart)  // show custom text in the tag while in edit-mode

        function onSelectSuggestion(e) {
            if (e.detail.event.target.matches('.remove-all-tags')) {
                tagify.removeAllTags()
            }

            // custom class from "dropdownHeaderTemplate"
            else if (e.detail.elm.classList.contains(`${tagify.settings.classNames.dropdownItem}__addAll`))
                tagify.dropdown.selectAll();
        }

        function onEditStart({ detail: { tag, data } }) {
            tagify.setTagTextNode(tag, `${data.name} <${data.email}>`)
        }

        // https://stackoverflow.com/a/9204568/104380
        function validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        }

        function parseFullValue(value) {
            // https://stackoverflow.com/a/11592042/104380
            var parts = value.split(/<(.*?)>/g),
                name = parts[0].trim(),
                email = parts[1]?.replace(/<(.*?)>/g, '').trim();

            return { name, email }
        }

    });

    document.addEventListener('DOMContentLoaded', function () {
        var input = document.querySelector('input[name="input-dropdown"]'),
            // init Tagify script on the above inputs
            tagify = new Tagify(input, {
                whitelist: ["A# .NET", "A# (Axiom)", "A-0 System", "A+", "A++", "ABAP", "ABC", "ABC ALGOL", "ABSET", "ABSYS", "ACC", "Accent", "Ace DASL", "ACL2", "Avicsoft", "ACT-III", "Action!", "ActionScript", "Ada", "Adenine", "Agda", "Agilent VEE", "Agora", "AIMMS", "Alef", "ALF", "ALGOL 58", "ALGOL 60", "ALGOL 68", "ALGOL W", "Alice", "Alma-0", "AmbientTalk", "Amiga E", "AMOS", "AMPL", "Apex (Salesforce.com)", "APL", "AppleScript", "Arc", "ARexx", "Argus", "AspectJ", "Assembly language", "ATS", "Ateji PX", "AutoHotkey", "Autocoder", "AutoIt", "AutoLISP / Visual LISP", "Averest", "AWK", "Axum", "Active Server Pages", "ASP.NET", "B", "Babbage", "Bash", "BASIC", "bc", "BCPL", "BeanShell", "Batch (Windows/Dos)", "Bertrand", "BETA", "Bigwig", "Bistro", "BitC", "BLISS", "Blockly", "BlooP", "Blue", "Boo", "Boomerang", "Bourne shell (including bash and ksh)", "BREW", "BPEL", "B", "C--", "C++ – ISO/IEC 14882", "C# – ISO/IEC 23270", "C/AL", "Caché ObjectScript", "C Shell", "Caml", "Cayenne", "CDuce", "Cecil", "Cesil", "Céu", "Ceylon", "CFEngine", "CFML", "Cg", "Ch", "Chapel", "Charity", "Charm", "Chef", "CHILL", "CHIP-8", "chomski", "ChucK", "CICS", "Cilk", "Citrine (programming language)", "CL (IBM)", "Claire", "Clarion", "Clean", "Clipper", "CLIPS", "CLIST", "Clojure", "CLU", "CMS-2", "COBOL – ISO/IEC 1989", "CobolScript – COBOL Scripting language", "Cobra", "CODE", "CoffeeScript", "ColdFusion", "COMAL", "Combined Programming Language (CPL)", "COMIT", "Common Intermediate Language (CIL)", "Common Lisp (also known as CL)", "COMPASS", "Component Pascal", "Constraint Handling Rules (CHR)", "COMTRAN", "Converge", "Cool", "Coq", "Coral 66", "Corn", "CorVision", "COWSEL", "CPL", "CPL", "Cryptol", "csh", "Csound", "CSP", "CUDA", "Curl", "Curry", "Cybil", "Cyclone", "Cython", "Java", "Javascript", "M2001", "M4", "M#", "Machine code", "MAD (Michigan Algorithm Decoder)", "MAD/I", "Magik", "Magma", "make", "Maple", "MAPPER now part of BIS", "MARK-IV now VISION:BUILDER", "Mary", "MASM Microsoft Assembly x86", "MATH-MATIC", "Mathematica", "MATLAB", "Maxima (see also Macsyma)", "Max (Max Msp – Graphical Programming Environment)", "Maya (MEL)", "MDL", "Mercury", "Mesa", "Metafont", "Microcode", "MicroScript", "MIIS", "Milk (programming language)", "MIMIC", "Mirah", "Miranda", "MIVA Script", "ML", "Model 204", "Modelica", "Modula", "Modula-2", "Modula-3", "Mohol", "MOO", "Mortran", "Mouse", "MPD", "Mathcad", "MSIL – deprecated name for CIL", "MSL", "MUMPS", "Mystic Programming L"],
                maxTags: 25,
                dropdown: {
                    maxItems: 20,           // <- mixumum allowed rendered suggestions
                    classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
                    enabled: 0,             // <- show suggestions on focus
                    closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
                }
            })
    });

    document.addEventListener('DOMContentLoaded', function () {
        var input = document.querySelector('textarea[name=tags2]'),
            tagify = new Tagify(input, {
                enforceWhitelist: true,
                delimiters: null,
                whitelist: ["The Shawshank Redemption", "The Godfather", "The Godfather: Part II", "The Dark Knight", "12 Angry Men", "Schindler's List", "Pulp Fiction", "The Lord of the Rings: The Return of the King", "The Good, the Bad and the Ugly", "Fight Club", "The Lord of the Rings: The Fellowship of the Ring", "Star Wars: Episode V - The Empire Strikes Back", "Forrest Gump", "Inception", "The Lord of the Rings: The Two Towers", "One Flew Over the Cuckoo's Nest", "Goodfellas", "The Matrix", "Seven Samurai", "Star Wars: Episode IV - A New Hope", "City of God", "Se7en", "The Silence of the Lambs", "It's a Wonderful Life", "The Usual Suspects", "Life Is Beautiful", "Léon: The Professional", "Spirited Away", "Saving Private Ryan", "La La Land", "Once Upon a Time in the West", "American History X", "Interstellar", "Casablanca", "Psycho", "City Lights", "The Green Mile", "Raiders of the Lost Ark", "The Intouchables", "Modern Times", "Rear Window", "The Pianist", "The Departed", "Terminator 2: Judgment Day", "Back to the Future", "Whiplash", "Gladiator", "Memento", "Apocalypse Now", "The Prestige", "The Lion King", "Alien", "Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb", "Sunset Boulevard", "The Great Dictator", "Cinema Paradiso", "The Lives of Others", "Paths of Glory", "Grave of the Fireflies", "Django Unchained", "The Shining", "WALL·E", "American Beauty", "The Dark Knight Rises", "Princess Mononoke", "Aliens", "Oldboy", "Once Upon a Time in America", "Citizen Kane", "Das Boot", "Witness for the Prosecution", "North by Northwest", "Vertigo", "Star Wars: Episode VI - Return of the Jedi", "Reservoir Dogs", "M", "Braveheart", "Amélie", "Requiem for a Dream", "A Clockwork Orange", "Taxi Driver", "Lawrence of Arabia", "Like Stars on Earth", "Double Indemnity", "To Kill a Mockingbird", "Eternal Sunshine of the Spotless Mind", "Toy Story 3", "Amadeus", "My Father and My Son", "Full Metal Jacket", "The Sting", "2001: A Space Odyssey", "Singin' in the Rain", "Bicycle Thieves", "Toy Story", "Dangal", "The Kid", "Inglourious Basterds", "Snatch", "Monty Python and the Holy Grail", "Hacksaw Ridge", "3 Idiots", "L.A. Confidential", "For a Few Dollars More", "Scarface", "Rashomon", "The Apartment", "The Hunt", "Good Will Hunting", "Indiana Jones and the Last Crusade", "A Separation", "Metropolis", "Yojimbo", "All About Eve", "Batman Begins", "Up", "Some Like It Hot", "The Treasure of the Sierra Madre", "Unforgiven", "Downfall", "Raging Bull", "The Third Man", "Die Hard", "Children of Heaven", "The Great Escape", "Heat", "Chinatown", "Inside Out", "Pan's Labyrinth", "Ikiru", "My Neighbor Totoro", "On the Waterfront", "Room", "Ran", "The Gold Rush", "The Secret in Their Eyes", "The Bridge on the River Kwai", "Blade Runner", "Mr. Smith Goes to Washington", "The Seventh Seal", "Howl's Moving Castle", "Lock, Stock and Two Smoking Barrels", "Judgment at Nuremberg", "Casino", "The Bandit", "Incendies", "A Beautiful Mind", "A Wednesday", "The General", "The Elephant Man", "Wild Strawberries", "Arrival", "V for Vendetta", "Warrior", "The Wolf of Wall Street", "Manchester by the Sea", "Sunrise", "The Passion of Joan of Arc", "Gran Torino", "Rang De Basanti", "Trainspotting", "Dial M for Murder", "The Big Lebowski", "The Deer Hunter", "Tokyo Story", "Gone with the Wind", "Fargo", "Finding Nemo", "The Sixth Sense", "The Thing", "Hera Pheri", "Cool Hand Luke", "Andaz Apna Apna", "Rebecca", "No Country for Old Men", "How to Train Your Dragon", "Munna Bhai M.B.B.S.", "Sholay", "Kill Bill: Vol. 1", "Into the Wild", "Mary and Max", "Gone Girl", "There Will Be Blood", "Come and See", "It Happened One Night", "Life of Brian", "Rush", "Hotel Rwanda", "Platoon", "Shutter Island", "Network", "The Wages of Fear", "Stand by Me", "Wild Tales", "In the Name of the Father", "Spotlight", "Star Wars: The Force Awakens", "The Nights of Cabiria", "The 400 Blows", "Butch Cassidy and the Sundance Kid", "Mad Max: Fury Road", "The Maltese Falcon", "12 Years a Slave", "Ben-Hur", "The Grand Budapest Hotel", "Persona", "Million Dollar Baby", "Amores Perros", "Jurassic Park", "The Princess Bride", "Hachi: A Dog's Tale", "Memories of Murder", "Stalker", "Nausicaä of the Valley of the Wind", "Drishyam", "The Truman Show", "The Grapes of Wrath", "Before Sunrise", "Touch of Evil", "Annie Hall", "The Message", "Rocky", "Gandhi", "Harry Potter and the Deathly Hallows: Part 2", "The Bourne Ultimatum", "Diabolique", "Donnie Darko", "Monsters, Inc.", "Prisoners", "8½", "The Terminator", "The Wizard of Oz", "Catch Me If You Can", "Groundhog Day", "Twelve Monkeys", "Zootopia", "La Haine", "Barry Lyndon", "Jaws", "The Best Years of Our Lives", "Infernal Affairs", "Udaan", "The Battle of Algiers", "Strangers on a Train", "Dog Day Afternoon", "Sin City", "Kind Hearts and Coronets", "Gangs of Wasseypur", "The Help"],
                callbacks: {
                    add: console.log,  // callback when adding a tag
                    remove: console.log   // callback when removing a tag
                }
            });
        // generate random whilist items (for the demo)
        var randomStringsArr = Array.apply(null, Array(100)).map(function () {
            return Array.apply(null, Array(~~(Math.random() * 10 + 3))).map(function () {
                return String.fromCharCode(Math.random() * (123 - 97) + 97)
            }).join('') + '@gmail.com'
        })
    });

    document.addEventListener('DOMContentLoaded', function () {
        var input = document.querySelector('input[name=tags-outside]')
        // init Tagify script on the above inputs
        var tagify = new Tagify(input, {
            whitelist: ["foo", "bar", "baz"],
            dropdown: {
                position: "input",
                enabled: 0 // always opens dropdown when input gets focus
            }
        })
    });

    document.addEventListener('DOMContentLoaded', function () {
        var input = document.querySelector('input[name=disabledInput]'),
            tagify = new Tagify(input);
    });

    if (jQuery("input[name=multiple]").length > 0) {
        document.addEventListener('DOMContentLoaded', function () {
            var inputElm = document.querySelector('input[name=multiple]'),
                whitelist = ["A# .NET", "A# (Axiom)", "A-0 System", "A+", "A++", "ABAP", "ABC", "ABC ALGOL", "ABSET", "ABSYS", "ACC", "Accent", "Ace DASL", "ACL2", "Avicsoft", "ACT-III", "Action!", "ActionScript", "Ada", "Adenine", "Agda", "Agilent VEE", "Agora", "AIMMS", "Alef", "ALF", "ALGOL 58", "ALGOL 60", "ALGOL 68", "ALGOL W", "Alice", "Alma-0", "AmbientTalk", "Amiga E", "AMOS", "AMPL", "Apex (Salesforce.com)", "APL", "AppleScript", "Arc", "ARexx", "Argus", "AspectJ", "Assembly language", "ATS", "Ateji PX", "AutoHotkey", "Autocoder", "AutoIt", "AutoLISP / Visual LISP", "Averest", "AWK", "Axum", "Active Server Pages", "ASP.NET", "B", "Babbage", "Bash", "BASIC", "bc", "BCPL", "BeanShell", "Batch (Windows/Dos)", "Bertrand", "BETA", "Bigwig", "Bistro", "BitC", "BLISS", "Blockly", "BlooP", "Blue", "Boo", "Boomerang", "Bourne shell (including bash and ksh)", "BREW", "BPEL", "B", "C--", "C++ – ISO/IEC 14882", "C# – ISO/IEC 23270", "C/AL", "Caché ObjectScript", "C Shell", "Caml", "Cayenne", "CDuce", "Cecil", "Cesil", "Céu", "Ceylon", "CFEngine", "CFML", "Cg", "Ch", "Chapel", "Charity", "Charm", "Chef", "CHILL", "CHIP-8", "chomski", "ChucK", "CICS", "Cilk", "Citrine (programming language)", "CL (IBM)", "Claire", "Clarion", "Clean", "Clipper", "CLIPS", "CLIST", "Clojure", "CLU", "CMS-2", "COBOL – ISO/IEC 1989", "CobolScript – COBOL Scripting language", "Cobra", "CODE", "CoffeeScript", "ColdFusion", "COMAL", "Combined Programming Language (CPL)", "COMIT", "Common Intermediate Language (CIL)", "Common Lisp (also known as CL)", "COMPASS", "Component Pascal", "Constraint Handling Rules (CHR)", "COMTRAN", "Converge", "Cool", "Coq", "Coral 66", "Corn", "CorVision", "COWSEL", "CPL", "CPL", "Cryptol", "csh", "Csound", "CSP", "CUDA", "Curl", "Curry", "Cybil", "Cyclone", "Cython", "Java", "Javascript", "M2001", "M4", "M#", "Machine code", "MAD (Michigan Algorithm Decoder)", "MAD/I", "Magik", "Magma", "make", "Maple", "MAPPER now part of BIS", "MARK-IV now VISION:BUILDER", "Mary", "MASM Microsoft Assembly x86", "MATH-MATIC", "Mathematica", "MATLAB", "Maxima (see also Macsyma)", "Max (Max Msp – Graphical Programming Environment)", "Maya (MEL)", "MDL", "Mercury", "Mesa", "Metafont", "Microcode", "MicroScript", "MIIS", "Milk (programming language)", "MIMIC", "Mirah", "Miranda", "MIVA Script", "ML", "Model 204", "Modelica", "Modula", "Modula-2", "Modula-3", "Mohol", "MOO", "Mortran", "Mouse", "MPD", "Mathcad", "MSIL – deprecated name for CIL", "MSL", "MUMPS", "Mystic Programming L"];

            // initialize Tagify on the above input node reference
            var tagify = new Tagify(inputElm, {
                enforceWhitelist: true,
                whitelist: inputElm.value.trim().split(/\s*,\s*/) // Array of values. stackoverflow.com/a/43375571/104380
            })

            // "remove all tags" button event listener
            document.querySelector('.tags--removeAllBtn')
                .addEventListener('click', tagify.removeAllTags.bind(tagify))

            // Chainable event listeners
            tagify.on('add', onAddTag)
                .on('remove', onRemoveTag)
                .on('input', onInput)
                .on('edit', onTagEdit)
                .on('invalid', onInvalidTag)
                .on('click', onTagClick)
                .on('focus', onTagifyFocusBlur)
                .on('blur', onTagifyFocusBlur)
                .on('dropdown:hide dropdown:show', e => console.log(e.type))
                .on('dropdown:select', onDropdownSelect)

            var mockAjax = (function mockAjax() {
                var timeout;
                return function (duration) {
                    clearTimeout(timeout); // abort last request
                    return new Promise(function (resolve, reject) {
                        timeout = setTimeout(resolve, duration || 700, whitelist)
                    })
                }
            })()

            // tag added callback
            function onAddTag(e) {
                console.log("onAddTag: ", e.detail);
                console.log("original input value: ", inputElm.value)
                tagify.off('add', onAddTag) // exmaple of removing a custom Tagify event
            }

            // tag remvoed callback
            function onRemoveTag(e) {
                console.log("onRemoveTag:", e.detail, "tagify instance value:", tagify.value)
            }

            // on character(s) added/removed (user is typing/deleting)
            function onInput(e) {
                console.log("onInput: ", e.detail);
                tagify.whitelist = null; // reset current whitelist
                tagify.loading(true) // show the loader animation

                // get new whitelist from a delayed mocked request (Promise)
                mockAjax()
                    .then(function (result) {
                        tagify.settings.whitelist = result.concat(tagify.value) // add already-existing tags to the new whitelist array

                        tagify
                            .loading(false)
                            // render the suggestions dropdown.
                            .dropdown.show(e.detail.value);
                    })
                    .catch(err => tagify.dropdown.hide())
            }

            function onTagEdit(e) {
                console.log("onTagEdit: ", e.detail);
            }

            // invalid tag added callback
            function onInvalidTag(e) {
                console.log("onInvalidTag: ", e.detail);
            }

            // invalid tag added callback
            function onTagClick(e) {
                console.log(e.detail);
                console.log("onTagClick: ", e.detail);
            }

            function onTagifyFocusBlur(e) {
                console.log(e.type, "event fired")
            }

            function onDropdownSelect(e) {
                console.log("onDropdownSelect: ", e.detail)
            }

        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        // generate random whilist items (for the demo)
        var randomStringsArr = Array.apply(null, Array(100)).map(function () {
            return Array.apply(null, Array(~~(Math.random() * 10 + 3))).map(function () {
                return String.fromCharCode(Math.random() * (123 - 97) + 97)
            }).join('') + '@gmail.com'
        })
    });

    if (jQuery("input[name=tags-select-mode]").length > 0) {
        document.addEventListener('DOMContentLoaded', function () {
            var input = document.querySelector('input[name=tags-select-mode]');

            // Check if the input element is found
            if (!input) {
                console.error('Input element not found');
                return;
            }

            // Initialize Tagify
            var tagify = new Tagify(input, {
                enforceWhitelist: true,
                mode: "select",
                whitelist: ["first option", "second option", "third option"],
                blacklist: ['foo', 'bar'],
            });

            // Check if DOM.input is defined before adding event listeners
            if (tagify.DOM && tagify.DOM.input) {
                // Bind events
                tagify.on('add', onAddTag);
                tagify.DOM.input.addEventListener('focus', onSelectFocus);
            } else {
                console.error('tagify.DOM.input is undefined');
            }

            function onAddTag(e) {
                console.log(e.detail);
            }

            function onSelectFocus(e) {
                console.log(e);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {

        var tagify = new Tagify(document.querySelector('input[name=country_world]'), {
            delimiters: null,
            templates: {
                tag: function (tagData) {
                    try {
                        return `<tag title='${tagData.value}' contenteditable='false' spellcheck="false" class='tagify__tag ${tagData.class ? tagData.class : ""}' ${this.getAttributes(tagData)}>
								<x title='remove tag' class='tagify__tag__removeBtn'></x>
								<div>
									${tagData.code ?
                                `<img onerror="this.style.visibility='hidden'" src='https://flagicons.lipis.dev/flags/4x3/${tagData.code.toLowerCase()}.svg'>` : ''
                            }
									<span class='tagify__tag-text'>${tagData.value}</span>
								</div>
							</tag>`
                    }
                    catch (err) { }
                },
                dropdownItem: function (tagData) {
                    try {
                        return `<div ${this.getAttributes(tagData)} class='tagify__dropdown__item ${tagData.class ? tagData.class : ""}' >
									<img onerror="this.style.visibility = 'hidden'"
										src='https://flagicons.lipis.dev/flags/4x3/${tagData.code.toLowerCase()}.svg'>
									<span>${tagData.value}</span>
								</div>`
                    }
                    catch (err) { console.error(err) }
                }
            },
            enforceWhitelist: true,
            whitelist: [
                { value: 'Afghanistan', code: 'AF' },
                { value: 'Åland Islands', code: 'AX' },
                { value: 'Albania', code: 'AL' },
                { value: 'Algeria', code: 'DZ' },
                { value: 'American Samoa', code: 'AS' },
                { value: 'Andorra', code: 'AD' },
                { value: 'Angola', code: 'AO' },
                { value: 'Anguilla', code: 'AI' },
                { value: 'Antarctica', code: 'AQ' },
                { value: 'Antigua and Barbuda', code: 'AG' },
                { value: 'Argentina', code: 'AR' },
                { value: 'Armenia', code: 'AM' },
                { value: 'Aruba', code: 'AW' },
                { value: 'Australia', code: 'AU', searchBy: 'beach, sub-tropical' },
                { value: 'Austria', code: 'AT' },
                { value: 'Azerbaijan', code: 'AZ' },
                { value: 'Bahamas', code: 'BS' },
                { value: 'Bahrain', code: 'BH' },
                { value: 'Bangladesh', code: 'BD' },
                { value: 'Barbados', code: 'BB' },
                { value: 'Belarus', code: 'BY' },
                { value: 'Belgium', code: 'BE' },
                { value: 'Belize', code: 'BZ' },
                { value: 'Benin', code: 'BJ' },
                { value: 'Bermuda', code: 'BM' },
                { value: 'Bhutan', code: 'BT' },
                { value: 'Bolivia', code: 'BO' },
                { value: 'Bosnia and Herzegovina', code: 'BA' },
                { value: 'Botswana', code: 'BW' },
                { value: 'Bouvet Island', code: 'BV' },
                { value: 'Brazil', code: 'BR' },
                { value: 'British Indian Ocean Territory', code: 'IO' },
                { value: 'Brunei Darussalam', code: 'BN' },
                { value: 'Bulgaria', code: 'BG' },
                { value: 'Burkina Faso', code: 'BF' },
                { value: 'Burundi', code: 'BI' },
                { value: 'Cambodia', code: 'KH' },
                { value: 'Cameroon', code: 'CM' },
                { value: 'Canada', code: 'CA' },
                { value: 'Cape Verde', code: 'CV' },
                { value: 'Cayman Islands', code: 'KY' },
                { value: 'Central African Republic', code: 'CF' },
                { value: 'Chad', code: 'TD' },
                { value: 'Chile', code: 'CL' },
                { value: 'China', code: 'CN' },
                { value: 'Christmas Island', code: 'CX' },
                { value: 'Cocos (Keeling) Islands', code: 'CC' },
                { value: 'Colombia', code: 'CO' },
                { value: 'Comoros', code: 'KM' },
                { value: 'Congo', code: 'CG' },
                { value: 'Congo, The Democratic Republic of the', code: 'CD' },
                { value: 'Cook Islands', code: 'CK' },
                { value: 'Costa Rica', code: 'CR' },
                { value: 'Cote D\'Ivoire', code: 'CI' },
                { value: 'Croatia', code: 'HR' },
                { value: 'Cuba', code: 'CU' },
                { value: 'Cyprus', code: 'CY' },
                { value: 'Czech Republic', code: 'CZ' },
                { value: 'Denmark', code: 'DK' },
                { value: 'Djibouti', code: 'DJ' },
                { value: 'Dominica', code: 'DM' },
                { value: 'Dominican Republic', code: 'DO' },
                { value: 'Ecuador', code: 'EC' },
                { value: 'Egypt', code: 'EG' },
                { value: 'El Salvador', code: 'SV' },
                { value: 'Equatorial Guinea', code: 'GQ' },
                { value: 'Eritrea', code: 'ER' },
                { value: 'Estonia', code: 'EE' },
                { value: 'Ethiopia', code: 'ET' },
                { value: 'Falkland Islands (Malvinas)', code: 'FK' },
                { value: 'Faroe Islands', code: 'FO' },
                { value: 'Fiji', code: 'FJ' },
                { value: 'Finland', code: 'FI' },
                { value: 'France', code: 'FR' },
                { value: 'French Guiana', code: 'GF' },
                { value: 'French Polynesia', code: 'PF' },
                { value: 'French Southern Territories', code: 'TF' },
                { value: 'Gabon', code: 'GA' },
                { value: 'Gambia', code: 'GM' },
                { value: 'Georgia', code: 'GE' },
                { value: 'Germany', code: 'DE' },
                { value: 'Ghana', code: 'GH' },
                { value: 'Gibraltar', code: 'GI' },
                { value: 'Greece', code: 'GR' },
                { value: 'Greenland', code: 'GL' },
                { value: 'Grenada', code: 'GD' },
                { value: 'Guadeloupe', code: 'GP' },
                { value: 'Guam', code: 'GU' },
                { value: 'Guatemala', code: 'GT' },
                { value: 'Guernsey', code: 'GG' },
                { value: 'Guinea', code: 'GN' },
                { value: 'Guinea-Bissau', code: 'GW' },
                { value: 'Guyana', code: 'GY' },
                { value: 'Haiti', code: 'HT' },
                { value: 'Heard Island and Mcdonald Islands', code: 'HM' },
                { value: 'Holy See (Vatican City State)', code: 'VA' },
                { value: 'Honduras', code: 'HN' },
                { value: 'Hong Kong', code: 'HK' },
                { value: 'Hungary', code: 'HU' },
                { value: 'Iceland', code: 'IS' },
                { value: 'India', code: 'IN' },
                { value: 'Indonesia', code: 'ID' },
                { value: 'Iran, Islamic Republic Of', code: 'IR' },
                { value: 'Iraq', code: 'IQ' },
                { value: 'Ireland', code: 'IE' },
                { value: 'Isle of Man', code: 'IM' },
                { value: 'Israel', code: 'IL', searchBy: 'holy land, desert' },
                { value: 'Italy', code: 'IT' },
                { value: 'Jamaica', code: 'JM' },
                { value: 'Japan', code: 'JP' },
                { value: 'Jersey', code: 'JE' },
                { value: 'Jordan', code: 'JO' },
                { value: 'Kazakhstan', code: 'KZ' },
                { value: 'Kenya', code: 'KE' },
                { value: 'Kiribati', code: 'KI' },
                { value: 'Korea, Democratic People\'S Republic of', code: 'KP' },
                { value: 'Korea, Republic of', code: 'KR' },
                { value: 'Kuwait', code: 'KW' },
                { value: 'Kyrgyzstan', code: 'KG' },
                { value: 'Lao People\'S Democratic Republic', code: 'LA' },
                { value: 'Latvia', code: 'LV' },
                { value: 'Lebanon', code: 'LB' },
                { value: 'Lesotho', code: 'LS' },
                { value: 'Liberia', code: 'LR' },
                { value: 'Libyan Arab Jamahiriya', code: 'LY' },
                { value: 'Liechtenstein', code: 'LI' },
                { value: 'Lithuania', code: 'LT' },
                { value: 'Luxembourg', code: 'LU' },
                { value: 'Macao', code: 'MO' },
                { value: 'Macedonia, The Former Yugoslav Republic of', code: 'MK' },
                { value: 'Madagascar', code: 'MG' },
                { value: 'Malawi', code: 'MW' },
                { value: 'Malaysia', code: 'MY' },
                { value: 'Maldives', code: 'MV' },
                { value: 'Mali', code: 'ML' },
                { value: 'Malta', code: 'MT' },
                { value: 'Marshall Islands', code: 'MH' },
                { value: 'Martinique', code: 'MQ' },
                { value: 'Mauritania', code: 'MR' },
                { value: 'Mauritius', code: 'MU' },
                { value: 'Mayotte', code: 'YT' },
                { value: 'Mexico', code: 'MX' },
                { value: 'Micronesia, Federated States of', code: 'FM' },
                { value: 'Moldova, Republic of', code: 'MD' },
                { value: 'Monaco', code: 'MC' },
                { value: 'Mongolia', code: 'MN' },
                { value: 'Montserrat', code: 'MS' },
                { value: 'Morocco', code: 'MA' },
                { value: 'Mozambique', code: 'MZ' },
                { value: 'Myanmar', code: 'MM' },
                { value: 'Namibia', code: 'NA' },
                { value: 'Nauru', code: 'NR' },
                { value: 'Nepal', code: 'NP' },
                { value: 'Netherlands', code: 'NL' },
                { value: 'Netherlands Antilles', code: 'AN' },
                { value: 'New Caledonia', code: 'NC' },
                { value: 'New Zealand', code: 'NZ' },
                { value: 'Nicaragua', code: 'NI' },
                { value: 'Niger', code: 'NE' },
                { value: 'Nigeria', code: 'NG' },
                { value: 'Niue', code: 'NU' },
                { value: 'Norfolk Island', code: 'NF' },
                { value: 'Northern Mariana Islands', code: 'MP' },
                { value: 'Norway', code: 'NO' },
                { value: 'Oman', code: 'OM' },
                { value: 'Pakistan', code: 'PK' },
                { value: 'Palau', code: 'PW' },
                { value: 'Palestinian Territory, Occupied', code: 'PS' },
                { value: 'Panama', code: 'PA' },
                { value: 'Papua New Guinea', code: 'PG' },
                { value: 'Paraguay', code: 'PY' },
                { value: 'Peru', code: 'PE' },
                { value: 'Philippines', code: 'PH' },
                { value: 'Pitcairn', code: 'PN' },
                { value: 'Poland', code: 'PL' },
                { value: 'Portugal', code: 'PT' },
                { value: 'Puerto Rico', code: 'PR' },
                { value: 'Qatar', code: 'QA' },
                { value: 'Reunion', code: 'RE' },
                { value: 'Romania', code: 'RO' },
                { value: 'Russian Federation', code: 'RU' },
                { value: 'RWANDA', code: 'RW' },
                { value: 'Saint Helena', code: 'SH' },
                { value: 'Saint Kitts and Nevis', code: 'KN' },
                { value: 'Saint Lucia', code: 'LC' },
                { value: 'Saint Pierre and Miquelon', code: 'PM' },
                { value: 'Saint Vincent and the Grenadines', code: 'VC' },
                { value: 'Samoa', code: 'WS' },
                { value: 'San Marino', code: 'SM' },
                { value: 'Sao Tome and Principe', code: 'ST' },
                { value: 'Saudi Arabia', code: 'SA' },
                { value: 'Senegal', code: 'SN' },
                { value: 'Serbia and Montenegro', code: 'CS' },
                { value: 'Seychelles', code: 'SC' },
                { value: 'Sierra Leone', code: 'SL' },
                { value: 'Singapore', code: 'SG' },
                { value: 'Slovakia', code: 'SK' },
                { value: 'Slovenia', code: 'SI' },
                { value: 'Solomon Islands', code: 'SB' },
                { value: 'Somalia', code: 'SO' },
                { value: 'South Africa', code: 'ZA' },
                { value: 'South Georgia and the South Sandwich Islands', code: 'GS' },
                { value: 'Spain', code: 'ES' },
                { value: 'Sri Lanka', code: 'LK' },
                { value: 'Sudan', code: 'SD' },
                { value: 'Suriname', code: 'SR' },
                { value: 'Svalbard and Jan Mayen', code: 'SJ' },
                { value: 'Swaziland', code: 'SZ' },
                { value: 'Sweden', code: 'SE' },
                { value: 'Switzerland', code: 'CH' },
                { value: 'Syrian Arab Republic', code: 'SY' },
                { value: 'Taiwan', code: 'TW' },
                { value: 'Tajikistan', code: 'TJ' },
                { value: 'Tanzania, United Republic of', code: 'TZ' },
                { value: 'Thailand', code: 'TH' },
                { value: 'Timor-Leste', code: 'TL' },
                { value: 'Togo', code: 'TG' },
                { value: 'Tokelau', code: 'TK' },
                { value: 'Tonga', code: 'TO' },
                { value: 'Trinidad and Tobago', code: 'TT' },
                { value: 'Tunisia', code: 'TN' },
                { value: 'Turkey', code: 'TR' },
                { value: 'Turkmenistan', code: 'TM' },
                { value: 'Turks and Caicos Islands', code: 'TC' },
                { value: 'Tuvalu', code: 'TV' },
                { value: 'Uganda', code: 'UG' },
                { value: 'Ukraine', code: 'UA' },
                { value: 'United Arab Emirates', code: 'AE' },
                { value: 'United Kingdom', code: 'GB' },
                { value: 'United States', code: 'US' },
                { value: 'United States Minor Outlying Islands', code: 'UM' },
                { value: 'Uruguay', code: 'UY' },
                { value: 'Uzbekistan', code: 'UZ' },
                { value: 'Vanuatu', code: 'VU' },
                { value: 'Venezuela', code: 'VE' },
                { value: 'Viet Nam', code: 'VN' },
                { value: 'Virgin Islands, British', code: 'VG' },
                { value: 'Virgin Islands, U.S.', code: 'VI' },
                { value: 'Wallis and Futuna', code: 'WF' },
                { value: 'Western Sahara', code: 'EH' },
                { value: 'Yemen', code: 'YE' },
                { value: 'Zambia', code: 'ZM' },
                { value: 'Zimbabwe', code: 'ZW' }
            ],
            maxTags: 1,
            dropdown: {
                enabled: 1, // suggest tags after a single character input
                classname: 'extra-properties' // custom class for the suggestions dropdown
            } // map tags' values to this property name, so this property will be the actual value and not the printed value on the screen

        })
        var tagify = new Tagify(document.querySelector('input[name=country_world2]'), {
            delimiters: null,
            templates: {
                tag: function (tagData) {
                    try {
                        return `<tag title='${tagData.value}' contenteditable='false' spellcheck="false" class='tagify__tag ${tagData.class ? tagData.class : ""}' ${this.getAttributes(tagData)}>
								<x title='remove tag' class='tagify__tag__removeBtn'></x>
								<div>
									${tagData.code ?
                                `<img onerror="this.style.visibility='hidden'" src='https://flagicons.lipis.dev/flags/4x3/${tagData.code.toLowerCase()}.svg'>` : ''
                            }
									<span class='tagify__tag-text'>${tagData.value}</span>
								</div>
							</tag>`
                    }
                    catch (err) { }
                },
                dropdownItem: function (tagData) {
                    try {
                        return `<div ${this.getAttributes(tagData)} class='tagify__dropdown__item ${tagData.class ? tagData.class : ""}' >
									<img onerror="this.style.visibility = 'hidden'"
										src='https://flagicons.lipis.dev/flags/4x3/${tagData.code.toLowerCase()}.svg'>
									<span>${tagData.value}</span>
								</div>`
                    }
                    catch (err) { console.error(err) }
                }
            },
            enforceWhitelist: true,
            whitelist: [
                { value: 'Palestine', code: 'PS' },
                { value: 'Afghanistan', code: 'AF' },
                { value: 'Åland Islands', code: 'AX' },
                { value: 'Albania', code: 'AL' },
                { value: 'Algeria', code: 'DZ' },
                { value: 'American Samoa', code: 'AS' },
                { value: 'Andorra', code: 'AD' },
                { value: 'Angola', code: 'AO' },
                { value: 'Anguilla', code: 'AI' },
                { value: 'Antarctica', code: 'AQ' },
                { value: 'Antigua and Barbuda', code: 'AG' },
                { value: 'Argentina', code: 'AR' },
                { value: 'Armenia', code: 'AM' },
                { value: 'Aruba', code: 'AW' },
                { value: 'Australia', code: 'AU', searchBy: 'beach, sub-tropical' },
                { value: 'Austria', code: 'AT' },
                { value: 'Azerbaijan', code: 'AZ' },
                { value: 'Bahamas', code: 'BS' },
                { value: 'Bahrain', code: 'BH' },
                { value: 'Bangladesh', code: 'BD' },
                { value: 'Barbados', code: 'BB' },
                { value: 'Belarus', code: 'BY' },
                { value: 'Belgium', code: 'BE' },
                { value: 'Belize', code: 'BZ' },
                { value: 'Benin', code: 'BJ' },
                { value: 'Bermuda', code: 'BM' },
                { value: 'Bhutan', code: 'BT' },
                { value: 'Bolivia', code: 'BO' },
                { value: 'Bosnia and Herzegovina', code: 'BA' },
                { value: 'Botswana', code: 'BW' },
                { value: 'Bouvet Island', code: 'BV' },
                { value: 'Brazil', code: 'BR' },
                { value: 'British Indian Ocean Territory', code: 'IO' },
                { value: 'Brunei Darussalam', code: 'BN' },
                { value: 'Bulgaria', code: 'BG' },
                { value: 'Burkina Faso', code: 'BF' },
                { value: 'Burundi', code: 'BI' },
                { value: 'Cambodia', code: 'KH' },
                { value: 'Cameroon', code: 'CM' },
                { value: 'Canada', code: 'CA' },
                { value: 'Cape Verde', code: 'CV' },
                { value: 'Cayman Islands', code: 'KY' },
                { value: 'Central African Republic', code: 'CF' },
                { value: 'Chad', code: 'TD' },
                { value: 'Chile', code: 'CL' },
                { value: 'China', code: 'CN' },
                { value: 'Christmas Island', code: 'CX' },
                { value: 'Cocos (Keeling) Islands', code: 'CC' },
                { value: 'Colombia', code: 'CO' },
                { value: 'Comoros', code: 'KM' },
                { value: 'Congo', code: 'CG' },
                { value: 'Congo, The Democratic Republic of the', code: 'CD' },
                { value: 'Cook Islands', code: 'CK' },
                { value: 'Costa Rica', code: 'CR' },
                { value: 'Cote D\'Ivoire', code: 'CI' },
                { value: 'Croatia', code: 'HR' },
                { value: 'Cuba', code: 'CU' },
                { value: 'Cyprus', code: 'CY' },
                { value: 'Czech Republic', code: 'CZ' },
                { value: 'Denmark', code: 'DK' },
                { value: 'Djibouti', code: 'DJ' },
                { value: 'Dominica', code: 'DM' },
                { value: 'Dominican Republic', code: 'DO' },
                { value: 'Ecuador', code: 'EC' },
                { value: 'Egypt', code: 'EG' },
                { value: 'El Salvador', code: 'SV' },
                { value: 'Equatorial Guinea', code: 'GQ' },
                { value: 'Eritrea', code: 'ER' },
                { value: 'Estonia', code: 'EE' },
                { value: 'Ethiopia', code: 'ET' },
                { value: 'Falkland Islands (Malvinas)', code: 'FK' },
                { value: 'Faroe Islands', code: 'FO' },
                { value: 'Fiji', code: 'FJ' },
                { value: 'Finland', code: 'FI' },
                { value: 'France', code: 'FR' },
                { value: 'French Guiana', code: 'GF' },
                { value: 'French Polynesia', code: 'PF' },
                { value: 'French Southern Territories', code: 'TF' },
                { value: 'Gabon', code: 'GA' },
                { value: 'Gambia', code: 'GM' },
                { value: 'Georgia', code: 'GE' },
                { value: 'Germany', code: 'DE' },
                { value: 'Ghana', code: 'GH' },
                { value: 'Gibraltar', code: 'GI' },
                { value: 'Greece', code: 'GR' },
                { value: 'Greenland', code: 'GL' },
                { value: 'Grenada', code: 'GD' },
                { value: 'Guadeloupe', code: 'GP' },
                { value: 'Guam', code: 'GU' },
                { value: 'Guatemala', code: 'GT' },
                { value: 'Guernsey', code: 'GG' },
                { value: 'Guinea', code: 'GN' },
                { value: 'Guinea-Bissau', code: 'GW' },
                { value: 'Guyana', code: 'GY' },
                { value: 'Haiti', code: 'HT' },
                { value: 'Heard Island and Mcdonald Islands', code: 'HM' },
                { value: 'Holy See (Vatican City State)', code: 'VA' },
                { value: 'Honduras', code: 'HN' },
                { value: 'Hong Kong', code: 'HK' },
                { value: 'Hungary', code: 'HU' },
                { value: 'Iceland', code: 'IS' },
                { value: 'India', code: 'IN' },
                { value: 'Indonesia', code: 'ID' },
                { value: 'Iran, Islamic Republic Of', code: 'IR' },
                { value: 'Iraq', code: 'IQ' },
                { value: 'Ireland', code: 'IE' },
                { value: 'Isle of Man', code: 'IM' },
                { value: 'Israel', code: 'IL', searchBy: 'holy land, desert' },
                { value: 'Italy', code: 'IT' },
                { value: 'Jamaica', code: 'JM' },
                { value: 'Japan', code: 'JP' },
                { value: 'Jersey', code: 'JE' },
                { value: 'Jordan', code: 'JO' },
                { value: 'Kazakhstan', code: 'KZ' },
                { value: 'Kenya', code: 'KE' },
                { value: 'Kiribati', code: 'KI' },
                { value: 'Korea, Democratic People\'S Republic of', code: 'KP' },
                { value: 'Korea, Republic of', code: 'KR' },
                { value: 'Kuwait', code: 'KW' },
                { value: 'Kyrgyzstan', code: 'KG' },
                { value: 'Lao People\'S Democratic Republic', code: 'LA' },
                { value: 'Latvia', code: 'LV' },
                { value: 'Lebanon', code: 'LB' },
                { value: 'Lesotho', code: 'LS' },
                { value: 'Liberia', code: 'LR' },
                { value: 'Libyan Arab Jamahiriya', code: 'LY' },
                { value: 'Liechtenstein', code: 'LI' },
                { value: 'Lithuania', code: 'LT' },
                { value: 'Luxembourg', code: 'LU' },
                { value: 'Macao', code: 'MO' },
                { value: 'Macedonia, The Former Yugoslav Republic of', code: 'MK' },
                { value: 'Madagascar', code: 'MG' },
                { value: 'Malawi', code: 'MW' },
                { value: 'Malaysia', code: 'MY' },
                { value: 'Maldives', code: 'MV' },
                { value: 'Mali', code: 'ML' },
                { value: 'Malta', code: 'MT' },
                { value: 'Marshall Islands', code: 'MH' },
                { value: 'Martinique', code: 'MQ' },
                { value: 'Mauritania', code: 'MR' },
                { value: 'Mauritius', code: 'MU' },
                { value: 'Mayotte', code: 'YT' },
                { value: 'Mexico', code: 'MX' },
                { value: 'Micronesia, Federated States of', code: 'FM' },
                { value: 'Moldova, Republic of', code: 'MD' },
                { value: 'Monaco', code: 'MC' },
                { value: 'Mongolia', code: 'MN' },
                { value: 'Montserrat', code: 'MS' },
                { value: 'Morocco', code: 'MA' },
                { value: 'Mozambique', code: 'MZ' },
                { value: 'Myanmar', code: 'MM' },
                { value: 'Namibia', code: 'NA' },
                { value: 'Nauru', code: 'NR' },
                { value: 'Nepal', code: 'NP' },
                { value: 'Netherlands', code: 'NL' },
                { value: 'Netherlands Antilles', code: 'AN' },
                { value: 'New Caledonia', code: 'NC' },
                { value: 'New Zealand', code: 'NZ' },
                { value: 'Nicaragua', code: 'NI' },
                { value: 'Niger', code: 'NE' },
                { value: 'Nigeria', code: 'NG' },
                { value: 'Niue', code: 'NU' },
                { value: 'Norfolk Island', code: 'NF' },
                { value: 'Northern Mariana Islands', code: 'MP' },
                { value: 'Norway', code: 'NO' },
                { value: 'Oman', code: 'OM' },
                { value: 'Pakistan', code: 'PK' },
                { value: 'Palau', code: 'PW' },
                { value: 'Palestinian Territory, Occupied', code: 'PS' },
                { value: 'Panama', code: 'PA' },
                { value: 'Papua New Guinea', code: 'PG' },
                { value: 'Paraguay', code: 'PY' },
                { value: 'Peru', code: 'PE' },
                { value: 'Philippines', code: 'PH' },
                { value: 'Pitcairn', code: 'PN' },
                { value: 'Poland', code: 'PL' },
                { value: 'Portugal', code: 'PT' },
                { value: 'Puerto Rico', code: 'PR' },
                { value: 'Qatar', code: 'QA' },
                { value: 'Reunion', code: 'RE' },
                { value: 'Romania', code: 'RO' },
                { value: 'Russian Federation', code: 'RU' },
                { value: 'RWANDA', code: 'RW' },
                { value: 'Saint Helena', code: 'SH' },
                { value: 'Saint Kitts and Nevis', code: 'KN' },
                { value: 'Saint Lucia', code: 'LC' },
                { value: 'Saint Pierre and Miquelon', code: 'PM' },
                { value: 'Saint Vincent and the Grenadines', code: 'VC' },
                { value: 'Samoa', code: 'WS' },
                { value: 'San Marino', code: 'SM' },
                { value: 'Sao Tome and Principe', code: 'ST' },
                { value: 'Saudi Arabia', code: 'SA' },
                { value: 'Senegal', code: 'SN' },
                { value: 'Serbia and Montenegro', code: 'CS' },
                { value: 'Seychelles', code: 'SC' },
                { value: 'Sierra Leone', code: 'SL' },
                { value: 'Singapore', code: 'SG' },
                { value: 'Slovakia', code: 'SK' },
                { value: 'Slovenia', code: 'SI' },
                { value: 'Solomon Islands', code: 'SB' },
                { value: 'Somalia', code: 'SO' },
                { value: 'South Africa', code: 'ZA' },
                { value: 'South Georgia and the South Sandwich Islands', code: 'GS' },
                { value: 'Spain', code: 'ES' },
                { value: 'Sri Lanka', code: 'LK' },
                { value: 'Sudan', code: 'SD' },
                { value: 'Suriname', code: 'SR' },
                { value: 'Svalbard and Jan Mayen', code: 'SJ' },
                { value: 'Swaziland', code: 'SZ' },
                { value: 'Sweden', code: 'SE' },
                { value: 'Switzerland', code: 'CH' },
                { value: 'Syrian Arab Republic', code: 'SY' },
                { value: 'Taiwan', code: 'TW' },
                { value: 'Tajikistan', code: 'TJ' },
                { value: 'Tanzania, United Republic of', code: 'TZ' },
                { value: 'Thailand', code: 'TH' },
                { value: 'Timor-Leste', code: 'TL' },
                { value: 'Togo', code: 'TG' },
                { value: 'Tokelau', code: 'TK' },
                { value: 'Tonga', code: 'TO' },
                { value: 'Trinidad and Tobago', code: 'TT' },
                { value: 'Tunisia', code: 'TN' },
                { value: 'Turkey', code: 'TR' },
                { value: 'Turkmenistan', code: 'TM' },
                { value: 'Turks and Caicos Islands', code: 'TC' },
                { value: 'Tuvalu', code: 'TV' },
                { value: 'Uganda', code: 'UG' },
                { value: 'Ukraine', code: 'UA' },
                { value: 'United Arab Emirates', code: 'AE' },
                { value: 'United Kingdom', code: 'GB' },
                { value: 'United States', code: 'US' },
                { value: 'United States Minor Outlying Islands', code: 'UM' },
                { value: 'Uruguay', code: 'UY' },
                { value: 'Uzbekistan', code: 'UZ' },
                { value: 'Vanuatu', code: 'VU' },
                { value: 'Venezuela', code: 'VE' },
                { value: 'Viet Nam', code: 'VN' },
                { value: 'Virgin Islands, British', code: 'VG' },
                { value: 'Virgin Islands, U.S.', code: 'VI' },
                { value: 'Wallis and Futuna', code: 'WF' },
                { value: 'Western Sahara', code: 'EH' },
                { value: 'Yemen', code: 'YE' },
                { value: 'Zambia', code: 'ZM' },
                { value: 'Zimbabwe', code: 'ZW' }
            ],
            maxTags: 1,
            dropdown: {
                enabled: 1, // suggest tags after a single character input
                classname: 'extra-properties' // custom class for the suggestions dropdown
            } // map tags' values to this property name, so this property will be the actual value and not the printed value on the screen

        })

        // Ensure that tagify.whitelist is an array before using the slice method
        if (Array.isArray(tagify.whitelist)) {
            var tagsToAdd = tagify.whitelist.slice(0, 2);
            tagify.addTags(tagsToAdd);
        }

        tagify.on('click', function (e) {
            console.log(e.detail);
        });

        tagify.on('remove', function (e) {
            console.log(e.detail);
        });

        tagify.on('add', function (e) {
            console.log("original Input:", tagify.DOM.originalInput);
            console.log("original Input's value:", tagify.DOM.originalInput.value);
            console.log("event detail:", e.detail);
        });
    });

    if (jQuery('.customLook').length > 0) {
        document.addEventListener('DOMContentLoaded', function () {

            // generate random whilist items (for the demo)
            var randomStringsArr = Array.apply(null, Array(100)).map(function () {
                return Array.apply(null, Array(~~(Math.random() * 10 + 3))).map(function () {
                    return String.fromCharCode(Math.random() * (123 - 97) + 97)
                }).join('') + '@gmail.com'
            })

            var input = document.querySelector('.customLook'),
                tagify = new Tagify(input, {
                    // email address validation (https://stackoverflow.com/a/46181/104380)
                    pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    whitelist: randomStringsArr,
                    callbacks: {
                        "invalid": onInvalidTag
                    },
                    dropdown: {
                        position: 'text',
                        enabled: 0 // show suggestions dropdown after 1 typed character
                    }
                }),
                button = input.nextElementSibling;  // "add new tag" action-button

            button.addEventListener("click", onAddButtonClick)

            function onAddButtonClick() {
                tagify.addEmptyTag()
            }

            function onInvalidTag(e) {
                console.log("invalid", e.detail)
            }

        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        // constructs the suggestion engine
        var states = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.whitespace,
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            // `states` is an array of state names defined in "The Basics"
            local: states
        });

        $('#bloodhound .typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        },
            {
                name: 'states',
                source: states
            });
    });


    // tagify Filters 
    if (jQuery('input[name=tagifyFilters]').length > 0) {
        document.addEventListener('DOMContentLoaded', function () {
            var $input = $('input[name=tagifyFilters]').tagify({
                whitelist: [
                    { "id": 1, "value": "some string" }
                ]
            })
                .on('add', function (e, tagName) {
                    console.log('JQEURY EVENT: ', 'added', tagName)
                })
                .on("invalid", function (e, tagName) {
                    console.log('JQEURY EVENT: ', "invalid", e, ' ', tagName);
                });

            // get the Tagify instance assigned for this jQuery input object 
            // so its methods could be accessed
            var jqTagify = $input.data('tagify');

            // bind the "click" event on the "remove all tags" button
            $('.tags-jquery--removeAllBtn').on('click', jqTagify.removeAllTags.bind(jqTagify))
        });
    }





})(jQuery);