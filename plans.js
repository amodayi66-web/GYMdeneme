// ============================================================================
// Expanded Pre-Made Training Plans — 25+ plans from beginner to advanced
// with goal classifications (Strength, Hypertrophy, Powerlifting, General)
// ============================================================================
const PLANS = [
  // ── BEGINNER ─────────────────────────────────────────────────────────────
  {
    id:'starter',
    name:'Starter Strength',
    level:'Beginner',
    goal:'Strength',
    duration:'45 min · 12 weeks',
    desc:'Three simple full-body sessions to learn core barbell lifts. Perfect for absolute beginners.',
    days:[
      ['Workout A',['Barbell Back Squat','Barbell Bench Press','Barbell Row']],
      ['Workout B',['Barbell Back Squat','Overhead Press (Strict)','Barbell Deadlift (Conventional)']],
      ['Workout C',['Barbell Back Squat','Barbell Bench Press','Barbell Row']]
    ]
  },
  {
    id:'fivex5',
    name:'5×5 Foundations',
    level:'Beginner',
    goal:'Strength',
    duration:'45 min · 12 weeks',
    desc:'A compact, progression-focused strength template built around five key lifts. Add weight every session.',
    days:[
      ['Workout A',['Barbell Back Squat','Barbell Bench Press','Barbell Row']],
      ['Workout B',['Barbell Back Squat','Overhead Press (Strict)','Barbell Deadlift (Conventional)']]
    ]
  },
  {
    id:'stronglifts',
    name:'StrongLifts 5×5',
    level:'Beginner',
    goal:'Strength',
    duration:'45 min · 12 weeks',
    desc:'The classic 5×5 program. Three alternating workouts, five sets of five reps. Simple and effective.',
    days:[
      ['Workout A',['Barbell Back Squat','Barbell Bench Press','Barbell Row']],
      ['Workout B',['Barbell Back Squat','Overhead Press (Strict)','Barbell Deadlift (Conventional)']]
    ]
  },
  {
    id:'starting-strength',
    name:'Starting Strength',
    level:'Beginner',
    goal:'Strength',
    duration:'60 min · 12 weeks',
    desc:'Mark Rippetoe\'s classic novice program. Focus on mastering the main barbell lifts with linear progression.',
    days:[
      ['Workout A',['Barbell Back Squat','Barbell Bench Press','Barbell Deadlift (Conventional)']],
      ['Workout B',['Barbell Back Squat','Overhead Press (Strict)','Barbell Row']]
    ]
  },
  {
    id:'dr-swole-fullbody',
    name:'Dr. Swole Full Body Powerbuilding Split',
    level:'Beginner',
    goal:'General',
    duration:'60 min · 8 weeks',
    desc:'Dr. Swole\'s science-based 3 Day Full Body Powerbuilding Split. Designed for hypertrophy and strength. Train full body 3x a week using Greyskull LP progression on main lifts with RPE-based accessory work.',
    days:[
      ['Full Body A',['Barbell Back Squat','Barbell Bench Press','Barbell Lunges','Barbell Row','Dumbbell Hammer Curl','Cable Triceps Pushdown','Dumbbell Lateral Raise','Calf Raise Machine (Standing)']],
      ['Full Body B',['Barbell Deadlift (Conventional)','Overhead Press (Strict)','Leg Press','Barbell Bench Press','Pull-up','EZ Bar Curl','Barbell Upright Row','Calf Raise Machine (Standing)']],
      ['Full Body C',['Barbell Back Squat','Barbell Bench Press','Romanian Deadlift','Cable Row','Dumbbell Curl','EZ Bar Skull Crusher','Dumbbell Lateral Raise','Calf Raise Machine (Standing)']]
    ]
  },
  {
    id:'greyskull',
    name:'Greyskull LP',
    level:'Beginner',
    goal:'Strength',
    duration:'45 min · 12 weeks',
    desc:'Phrak\'s Greyskull variant. Linear progression with AMRAP final sets for extra hypertrophy stimulus.',
    days:[
      ['Day A',['Barbell Back Squat','Barbell Bench Press','Barbell Row']],
      ['Day B',['Barbell Back Squat','Overhead Press (Strict)','Barbell Deadlift (Conventional)']]
    ]
  },

  // ── INTERMEDIATE ─────────────────────────────────────────────────────────
  {
    id:'ppl',
    name:'Push / Pull / Legs',
    level:'Intermediate',
    goal:'Hypertrophy',
    duration:'60 min · 12 weeks',
    desc:'A balanced three-day split for building muscle with focused sessions. Train 6 days/week on rotation.',
    days:[
      ['Push',['Barbell Bench Press','Overhead Press (Strict)','Dumbbell Lateral Raise','Cable Triceps Pushdown','Dumbbell Incline Press']],
      ['Pull',['Barbell Row','Lat Pulldown','Cable Face Pull','Dumbbell Curl','Dumbbell Hammer Curl']],
      ['Legs',['Barbell Back Squat','Romanian Deadlift','Leg Extension','Calf Raise Machine (Standing)','Hanging Leg Raise']]
    ]
  },
  {
    id:'ppl-advanced',
    name:'PPL Advanced',
    level:'Intermediate',
    goal:'Hypertrophy',
    duration:'75 min · 12 weeks',
    desc:'Higher volume Push/Pull/Legs with more accessories. For those who want extra hypertrophy work.',
    days:[
      ['Push Heavy',['Barbell Bench Press','Overhead Press (Strict)','Dumbbell Incline Press','Dumbbell Lateral Raise','Cable Triceps Pushdown','Dumbbell Overhead Triceps Extension']],
      ['Pull Heavy',['Barbell Deadlift (Conventional)','Barbell Row','Lat Pulldown','Cable Face Pull','Dumbbell Curl','Dumbbell Hammer Curl']],
      ['Legs Heavy',['Barbell Back Squat','Romanian Deadlift','Leg Press','Leg Extension','Seated Leg Curl','Calf Raise Machine (Standing)']],
      ['Push Light',['Dumbbell Bench Press','Dumbbell Shoulder Press','Cable Chest Fly','Dumbbell Lateral Raise','Cable Triceps Pushdown']],
      ['Pull Light',['Cable Row','Pull-up','Cable Reverse Fly','Cable Biceps Curl','Cable Hammer Curl']],
      ['Legs Light',['Barbell Front Squat','Dumbbell Bulgarian Split Squat','Lying Leg Curl','Calf Raise Machine (Seated)','Plank']]
    ]
  },
  {
    id:'upper-lower',
    name:'Upper / Lower Split',
    level:'Intermediate',
    goal:'General',
    duration:'60 min · 12 weeks',
    desc:'Classic 4-day upper/lower split. Train each muscle group twice per week for balanced growth.',
    days:[
      ['Upper A',['Barbell Bench Press','Barbell Row','Overhead Press (Strict)','Dumbbell Curl','Cable Triceps Pushdown']],
      ['Lower A',['Barbell Back Squat','Romanian Deadlift','Leg Extension','Calf Raise Machine (Standing)','Hanging Leg Raise']],
      ['Upper B',['Barbell Incline Bench Press','Lat Pulldown','Dumbbell Lateral Raise','Dumbbell Hammer Curl','Dumbbell Overhead Triceps Extension']],
      ['Lower B',['Barbell Deadlift (Conventional)','Barbell Lunges','Seated Leg Curl','Calf Raise Machine (Seated)','Plank']]
    ]
  },
  {
    id:'bro-split',
    name:'Bro Split (5-Day)',
    level:'Intermediate',
    goal:'Hypertrophy',
    duration:'60 min · 12 weeks',
    desc:'The classic bodybuilding split. Each muscle group gets its own day for maximum focus and volume.',
    days:[
      ['Chest',['Barbell Bench Press','Dumbbell Incline Press','Cable Chest Fly','Pec Deck (Chest Fly Machine)','Push-up']],
      ['Back',['Barbell Deadlift (Conventional)','Barbell Row','Lat Pulldown','Cable Row','Pull-up']],
      ['Shoulders',['Overhead Press (Strict)','Dumbbell Lateral Raise','Dumbbell Front Raise','Cable Face Pull','Dumbbell Rear Delt Fly']],
      ['Legs',['Barbell Back Squat','Leg Press','Leg Extension','Seated Leg Curl','Calf Raise Machine (Standing)']],
      ['Arms',['Barbell Curl','Dumbbell Hammer Curl','Cable Triceps Pushdown','Dumbbell Overhead Triceps Extension','EZ Bar Skull Crusher']]
    ]
  },
  {
    id:'phul',
    name:'PHUL (Power Hypertrophy)',
    level:'Intermediate',
    goal:'Strength',
    duration:'60 min · 8 weeks',
    desc:'Power Hypertrophy Upper Lower. Combines strength and size training in one 4-day program.',
    days:[
      ['Upper Power',['Barbell Bench Press','Barbell Row','Overhead Press (Strict)','Barbell Curl','Cable Triceps Pushdown']],
      ['Lower Power',['Barbell Back Squat','Barbell Deadlift (Conventional)','Leg Press','Calf Raise Machine (Standing)']],
      ['Upper Hypertrophy',['Dumbbell Incline Press','Cable Row','Dumbbell Lateral Raise','Dumbbell Curl','Cable Overhead Triceps Extension']],
      ['Lower Hypertrophy',['Barbell Front Squat','Romanian Deadlift','Leg Extension','Seated Leg Curl','Calf Raise Machine (Seated)']]
    ]
  },
  {
    id:'phat',
    name:'PHAT (Power Hypertrophy Adaptive)',
    level:'Intermediate',
    goal:'Hypertrophy',
    duration:'75 min · 12 weeks',
    desc:'Layne Norton\'s PHAT. 5 days combining strength and bodybuilding for advanced intermediate lifters.',
    days:[
      ['Upper Power',['Barbell Bench Press','Barbell Row','Overhead Press (Strict)','Pull-up','Barbell Curl']],
      ['Lower Power',['Barbell Back Squat','Barbell Deadlift (Conventional)','Leg Press','Calf Raise Machine (Standing)']],
      ['Back & Shoulders',['Cable Row','Lat Pulldown','Dumbbell Lateral Raise','Cable Face Pull','Dumbbell Rear Delt Fly']],
      ['Legs Hypertrophy',['Barbell Front Squat','Romanian Deadlift','Leg Extension','Seated Leg Curl','Calf Raise Machine (Seated)']],
      ['Chest & Arms',['Dumbbell Bench Press','Dumbbell Incline Press','Cable Chest Fly','Dumbbell Curl','Cable Triceps Pushdown']]
    ]
  },
  {
    id:'gzclp',
    name:'GZCLP Structure',
    level:'Intermediate',
    goal:'Strength',
    duration:'60 min · 14 weeks',
    desc:'Four rotating sessions using heavy, volume, and accessory work. Cody LeFever\'s popular method.',
    days:[
      ['A1 · Squat',['Barbell Back Squat','Barbell Bench Press','Lat Pulldown','Dumbbell Lateral Raise','Plank']],
      ['B1 · Press',['Overhead Press (Strict)','Barbell Deadlift (Conventional)','Dumbbell Row','Dumbbell Curl','Hanging Leg Raise']],
      ['A2 · Bench',['Barbell Bench Press','Barbell Back Squat','Cable Row','Cable Triceps Pushdown','Plank']],
      ['B2 · Deadlift',['Barbell Deadlift (Conventional)','Overhead Press (Strict)','Cable Face Pull','Dumbbell Hammer Curl','Hanging Leg Raise']]
    ]
  },
  {
    id:'nSuns',
    name:'nSuns 4-Day',
    level:'Intermediate',
    goal:'Strength',
    duration:'60 min · 12 weeks',
    desc:'High volume linear progression based on the Sheiko-inspired 5/3/1 variant. Lots of heavy sets.',
    days:[
      ['Bench Heavy',['Barbell Bench Press','Overhead Press (Strict)','Dumbbell Row','Dumbbell Lateral Raise','Cable Triceps Pushdown']],
      ['Squat Heavy',['Barbell Back Squat','Barbell Sumo Deadlift','Leg Press','Leg Extension','Hanging Leg Raise']],
      ['OHP Heavy',['Overhead Press (Strict)','Barbell Incline Bench Press','Lat Pulldown','Dumbbell Curl','Cable Face Pull']],
      ['Deadlift Heavy',['Barbell Deadlift (Conventional)','Barbell Front Squat','Cable Row','Calf Raise Machine (Standing)','Plank']]
    ]
  },

  // ── ADVANCED ─────────────────────────────────────────────────────────────
  {
    id:'531-bbb',
    name:'5/3/1 Boring But Big',
    level:'Advanced',
    goal:'Hypertrophy',
    duration:'60 min · 16 weeks',
    desc:'Jim Wendler\'s 5/3/1 with BBB. Main work followed by 5×10 accessories for massive size gains.',
    days:[
      ['Squat 5/3/1',['Barbell Back Squat','Leg Press','Leg Extension','Seated Leg Curl','Calf Raise Machine (Standing)']],
      ['Bench 5/3/1',['Barbell Bench Press','Dumbbell Bench Press','Cable Chest Fly','Cable Triceps Pushdown','Dumbbell Curl']],
      ['Deadlift 5/3/1',['Barbell Deadlift (Conventional)','Barbell Hip Thrust','Barbell Row','Lat Pulldown','Hanging Leg Raise']],
      ['OHP 5/3/1',['Overhead Press (Strict)','Dumbbell Shoulder Press','Dumbbell Lateral Raise','Cable Face Pull','Dumbbell Hammer Curl']]
    ]
  },
  {
    id:'531-fsl',
    name:'5/3/1 First Set Last',
    level:'Advanced',
    goal:'Strength',
    duration:'50 min · 16 weeks',
    desc:'5/3/1 with FSL. After main work, do one more set at the first set weight for extra volume without burnout.',
    days:[
      ['Press Day',['Overhead Press (Strict)','Dumbbell Bench Press','Dumbbell Lateral Raise','Cable Triceps Pushdown','Pull-up']],
      ['Deadlift Day',['Barbell Deadlift (Conventional)','Barbell Back Squat','Barbell Hip Thrust','Hanging Leg Raise','Plank']],
      ['Bench Day',['Barbell Bench Press','Dumbbell Incline Press','Cable Chest Fly','Dumbbell Curl','Cable Triceps Pushdown']],
      ['Squat Day',['Barbell Back Squat','Leg Press','Romanian Deadlift','Calf Raise Machine (Standing)','Hanging Leg Raise']]
    ]
  },
  {
    id:'smolov',
    name:'Smolov Squat Cycle',
    level:'Advanced',
    goal:'Strength',
    duration:'90 min · 13 weeks',
    desc:'The infamous Smolov squat program. Extremely high volume and frequency. For experienced lifters only.',
    days:[
      ['Squat Heavy',['Barbell Back Squat','Leg Press','Leg Extension','Calf Raise Machine (Standing)']],
      ['Squat Volume',['Barbell Back Squat','Barbell Front Squat','Leg Press','Hanging Leg Raise']],
      ['Squat Light',['Barbell Back Squat','Leg Extension','Seated Leg Curl','Plank']],
      ['Squat Medium',['Barbell Back Squat','Barbell Lunges','Calf Raise Machine (Seated)','Hanging Leg Raise']]
    ]
  },
  {
    id:'juggernaut',
    name:'Juggernaut Method',
    level:'Advanced',
    goal:'Strength',
    duration:'75 min · 16 weeks',
    desc:'Chad Wesley Smith\'s Juggernaut. 4 waves of 10s, 8s, 5s, 3s for long-term strength progression.',
    days:[
      ['Squat Wave',['Barbell Back Squat','Leg Press','Romanian Deadlift','Calf Raise Machine (Standing)','Plank']],
      ['Bench Wave',['Barbell Bench Press','Dumbbell Incline Press','Cable Chest Fly','Cable Triceps Pushdown','Dumbbell Curl']],
      ['Deadlift Wave',['Barbell Deadlift (Conventional)','Barbell Row','Lat Pulldown','Barbell Hip Thrust','Hanging Leg Raise']],
      ['Press Wave',['Overhead Press (Strict)','Dumbbell Shoulder Press','Dumbbell Lateral Raise','Cable Face Pull','Dumbbell Hammer Curl']]
    ]
  },
  {
    id:'sheiko',
    name:'Sheiko Advanced',
    level:'Advanced',
    goal:'Powerlifting',
    duration:'90 min · 12 weeks',
    desc:'Boris Sheiko\'s advanced powerlifting program. High frequency, high volume for competition prep.',
    days:[
      ['Bench & Squat',['Barbell Bench Press','Barbell Back Squat','Dumbbell Bench Press','Leg Extension','Plank']],
      ['Deadlift & Press',['Barbell Deadlift (Conventional)','Overhead Press (Strict)','Barbell Row','Cable Row','Hanging Leg Raise']],
      ['Squat & Bench',['Barbell Back Squat','Barbell Bench Press','Leg Press','Cable Triceps Pushdown','Dumbbell Curl']],
      ['Deadlift & Squat',['Barbell Deadlift (Conventional)','Barbell Front Squat','Lat Pulldown','Calf Raise Machine (Standing)','Plank']]
    ]
  },
  {
    id:'westside',
    name:'Westside Barbell',
    level:'Advanced',
    goal:'Powerlifting',
    duration:'90 min · 12 weeks',
    desc:'The Conjugate Method from Westside Barbell. Max effort and dynamic effort days for elite strength.',
    days:[
      ['Max Effort Upper',['Barbell Bench Press','Barbell Row','Overhead Press (Strict)','Dumbbell Curl','Cable Triceps Pushdown']],
      ['Max Effort Lower',['Barbell Back Squat','Barbell Deadlift (Conventional)','Leg Press','Calf Raise Machine (Standing)','Hanging Leg Raise']],
      ['Dynamic Effort Upper',['Dumbbell Bench Press','Cable Row','Dumbbell Lateral Raise','Dumbbell Hammer Curl','Cable Overhead Triceps Extension']],
      ['Dynamic Effort Lower',['Barbell Front Squat','Barbell Sumo Deadlift','Leg Extension','Seated Leg Curl','Plank']]
    ]
  },
  {
    id:'dr-swole-advanced',
    name:'Dr. Swole Advanced Full Body',
    level:'Advanced',
    goal:'General',
    duration:'75 min · 8 weeks',
    desc:'Dr. Swole\'s advanced full body program. Higher intensity and volume for experienced lifters.',
    days:[
      ['Full Body Power',['Barbell Back Squat','Barbell Bench Press','Barbell Row','Overhead Press (Strict)','Barbell Deadlift (Conventional)']],
      ['Full Body Hypertrophy',['Barbell Front Squat','Dumbbell Incline Press','Lat Pulldown','Dumbbell Lateral Raise','Dumbbell Curl','Cable Triceps Pushdown']],
      ['Full Body Strength',['Barbell Deadlift (Conventional)','Barbell Incline Bench Press','Barbell Row','Dumbbell Shoulder Press','Hanging Leg Raise']]
    ]
  },

  // ── NEW PLANS ────────────────────────────────────────────────────────────

  // Madcow 5×5 (Strength, Intermediate)
  {
    id:'madcow',
    name:'Madcow 5×5',
    level:'Intermediate',
    goal:'Strength',
    duration:'60 min · 12 weeks',
    desc:'Bill Starr\'s Madcow 5×5. A weekly linear progression with ramped sets. Ideal after StrongLifts/Starting Strength.',
    days:[
      ['Heavy A',['Barbell Back Squat','Barbell Bench Press','Barbell Row']],
      ['Light',['Barbell Back Squat','Overhead Press (Strict)','Barbell Row']],
      ['Heavy B',['Barbell Back Squat','Barbell Bench Press','Barbell Deadlift (Conventional)']]
    ]
  },

  // Texas Method (Strength, Intermediate)
  {
    id:'texas-method',
    name:'Texas Method',
    level:'Intermediate',
    goal:'Strength',
    duration:'75 min · 12 weeks',
    desc:'The classic Texas Method: Volume Monday, Intensity Wednesday, Recovery Friday. Proven strength builder.',
    days:[
      ['Volume',['Barbell Back Squat','Barbell Bench Press','Barbell Row']],
      ['Recovery',['Barbell Front Squat','Overhead Press (Strict)','Pull-up']],
      ['Intensity',['Barbell Back Squat','Barbell Bench Press','Barbell Deadlift (Conventional)']]
    ]
  },

  // Arnold Blueprint (Hypertrophy, Intermediate)
  {
    id:'arnold-blueprint',
    name:'Arnold Blueprint',
    level:'Intermediate',
    goal:'Hypertrophy',
    duration:'75 min · 8 weeks',
    desc:'Inspired by Arnold Schwarzenegger\'s classic bodybuilding split. High volume, double-split training.',
    days:[
      ['Chest & Back',['Barbell Bench Press','Barbell Row','Dumbbell Incline Press','Lat Pulldown','Cable Chest Fly','Pull-up']],
      ['Shoulders & Arms',['Overhead Press (Strict)','Dumbbell Lateral Raise','Barbell Curl','Cable Triceps Pushdown','Dumbbell Hammer Curl','Dumbbell Rear Delt Fly']],
      ['Chest & Back',['Dumbbell Bench Press','Cable Row','Barbell Incline Bench Press','Cable Face Pull','Pec Deck (Chest Fly Machine)','Australian Row (Inverted Row)']],
      ['Shoulders & Arms',['Dumbbell Shoulder Press','Cable Lateral Raise','EZ Bar Curl','EZ Bar Skull Crusher','Dumbbell Concentration Curl','Dumbbell Overhead Triceps Extension']],
      ['Legs',['Barbell Back Squat','Leg Press','Romanian Deadlift','Leg Extension','Seated Leg Curl','Calf Raise Machine (Standing)']],
      ['Chest & Back',['Push-up','Barbell Pendlay Row','Decline Push-up','Cable Pullover','Dip','Barbell Shrug']]
    ]
  },

  // German Volume Training (Hypertrophy, Intermediate)
  {
    id:'gvt',
    name:'German Volume Training',
    level:'Intermediate',
    goal:'Hypertrophy',
    duration:'75 min · 8 weeks',
    desc:'10 sets of 10 reps. The classic German Volume Training method for massive hypertrophy gains.',
    days:[
      ['Chest & Back',['Barbell Bench Press','Barbell Row','Dumbbell Incline Press','Lat Pulldown']],
      ['Legs & Abs',['Barbell Back Squat','Leg Press','Leg Extension','Cable Crunch']],
      ['Shoulders & Arms',['Overhead Press (Strict)','Barbell Curl','Cable Triceps Pushdown','Dumbbell Lateral Raise']],
      ['Full Body',['Barbell Deadlift (Conventional)','Dumbbell Bench Press','Cable Row','Plank']]
    ]
  },

  // DC Training (Strength, Advanced)
  {
    id:'dc-training',
    name:'Dogg Crapp Training',
    level:'Advanced',
    goal:'Hypertrophy',
    duration:'60 min · 12 weeks',
    desc:'Dante Trudel\'s DC Training. One all-out work set per exercise with rest-pause and extreme intensity.',
    days:[
      ['A',['Barbell Back Squat','Barbell Bench Press','Barbell Row','Overhead Press (Strict)','Barbell Deadlift (Conventional)']],
      ['B',['Barbell Front Squat','Dumbbell Incline Press','Lat Pulldown','Dumbbell Lateral Raise','Romanian Deadlift']],
      ['C',['Leg Press','Barbell Bench Press','Cable Row','Dumbbell Shoulder Press','Barbell Curl']]
    ]
  },

  // Tactical Barbell (General Fitness, Intermediate)
  {
    id:'tactical-barbell',
    name:'Tactical Barbell',
    level:'Intermediate',
    goal:'General',
    duration:'50 min · 8 weeks',
    desc:'Strength and conditioning hybrid. Build work capacity while maintaining strength. Great for athletes.',
    days:[
      ['Strength A',['Barbell Back Squat','Barbell Bench Press','Barbell Row']],
      ['Conditioning',['Kettlebell Swing','Burpee','Box Jump','Sled Push','Plank']],
      ['Strength B',['Barbell Deadlift (Conventional)','Overhead Press (Strict)','Pull-up']],
      ['Conditioning',['Kettlebell Snatch','Mountain Climber','Walking Lunge','Medicine Ball Slam','Side Plank']]
    ]
  },

  // Coan/Philippi Deadlift (Powerlifting, Advanced)
  {
    id:'coan-deadlift',
    name:'Coan/Philippi Deadlift',
    level:'Advanced',
    goal:'Powerlifting',
    duration:'75 min · 10 weeks',
    desc:'The legendary Coan/Philippi deadlift program. Specialized deadlift cycle for massive pull numbers.',
    days:[
      ['Deadlift Speed',['Barbell Deadlift (Conventional)','Barbell Row','Leg Press','Barbell Shrug']],
      ['Deadlift Max Effort',['Barbell Sumo Deadlift','Romanian Deadlift','Lat Pulldown','Hyperextension Bench']],
      ['Deadlift Volume',['Trap Bar Deadlift','Barbell Good Morning','Seated Leg Curl','Cable Row','Plank']]
    ]
  },

  // HIT Mentzer (Hypertrophy, Advanced)
  {
    id:'hit-mentzer',
    name:'HIT (Mike Mentzer)',
    level:'Advanced',
    goal:'Hypertrophy',
    duration:'30 min · 8 weeks',
    desc:'Mike Mentzer\'s High Intensity Training. One set to absolute failure. Minimal volume, maximum intensity.',
    days:[
      ['Full Body 1',['Barbell Back Squat','Barbell Bench Press','Lat Pulldown','Overhead Press (Strict)','Barbell Curl','Cable Triceps Pushdown']],
      ['Full Body 2',['Barbell Deadlift (Conventional)','Dumbbell Incline Press','Cable Row','Dumbbell Lateral Raise','Dumbbell Hammer Curl','Dumbbell Overhead Triceps Extension']]
    ]
  },

  // Cube Method (Powerlifting, Advanced)
  {
    id:'cube-method',
    name:'Cube Method',
    level:'Advanced',
    goal:'Powerlifting',
    duration:'90 min · 12 weeks',
    desc:'Brandon Lilly\'s Cube Method. A 3-week rotating cycle of Max Effort, Rep Effort, and Dynamic Effort.',
    days:[
      ['ME Bench',['Barbell Bench Press','Dumbbell Bench Press','Cable Chest Fly','Dumbbell Curl','Cable Triceps Pushdown']],
      ['ME Squat',['Barbell Back Squat','Leg Press','Leg Extension','Barbell Good Morning','Plank']],
      ['ME Deadlift',['Barbell Deadlift (Conventional)','Barbell Row','Romanian Deadlift','Lat Pulldown','Hanging Leg Raise']],
      ['RE Upper',['Barbell Incline Bench Press','Cable Row','Dumbbell Lateral Raise','Dumbbell Hammer Curl','Cable Overhead Triceps Extension']],
      ['DE Lower',['Barbell Front Squat','Barbell Sumo Deadlift','Seated Leg Curl','Calf Raise Machine (Standing)','Hyperextension Bench']],
      ['RE Lower',['Barbell Back Squat','Barbell Deadlift (Conventional)','Leg Press','Hanging Leg Raise']]
    ]
  },

  // 5/3/1 Triumvirate (Strength, Intermediate)
  {
    id:'531-triumvirate',
    name:'5/3/1 Triumvirate',
    level:'Intermediate',
    goal:'Strength',
    duration:'45 min · 16 weeks',
    desc:'Jim Wendler\'s 5/3/1 Triumvirate. Three exercises per day: main lift, push, and pull. Simple and effective.',
    days:[
      ['Squat Day',['Barbell Back Squat','Dumbbell Bench Press','Barbell Row']],
      ['Bench Day',['Barbell Bench Press','Dumbbell Shoulder Press','Cable Row']],
      ['Deadlift Day',['Barbell Deadlift (Conventional)','Barbell Hip Thrust','Pull-up']],
      ['Press Day',['Overhead Press (Strict)','Dumbbell Incline Press','Lat Pulldown']]
    ]
  },

  // Jim Stoppani Shortcut to Size (Hypertrophy, Intermediate)
  {
    id:'shortcut-to-size',
    name:'Shortcut to Size',
    level:'Intermediate',
    goal:'Hypertrophy',
    duration:'60 min · 12 weeks',
    desc:'Jim Stoppani\'s Shortcut to Size. Uses 5-10-15-20 rep scheme for progressive overload and muscle growth.',
    days:[
      ['Chest & Abs',['Barbell Bench Press','Dumbbell Incline Press','Cable Chest Fly','Push-up','Plank','Hanging Leg Raise']],
      ['Back & Biceps',['Barbell Deadlift (Conventional)','Barbell Row','Lat Pulldown','Cable Row','Barbell Curl','Dumbbell Hammer Curl']],
      ['Shoulders & Abs',['Overhead Press (Strict)','Dumbbell Lateral Raise','Cable Face Pull','Dumbbell Rear Delt Fly','Cable Crunch','Side Plank']],
      ['Legs & Abs',['Barbell Back Squat','Leg Press','Leg Extension','Seated Leg Curl','Calf Raise Machine (Standing)','Plank']],
      ['Arms',['Barbell Curl','EZ Bar Skull Crusher','Dumbbell Concentration Curl','Cable Overhead Triceps Extension','Dumbbell Hammer Curl','Cable Triceps Pushdown']]
    ]
  },

  // Bullmastiff (Strength, Intermediate)
  {
    id:'bullmastiff',
    name:'Bullmastiff',
    level:'Intermediate',
    goal:'Strength',
    duration:'60 min · 8 weeks',
    desc:'A 4-day upper/lower program by Alex Bromley. Daily undulating periodization with heavy singles and back-off sets.',
    days:[
      ['Heavy Upper',['Barbell Bench Press','Barbell Row','Overhead Press (Strict)','Pull-up','Dumbbell Curl']],
      ['Heavy Lower',['Barbell Back Squat','Barbell Deadlift (Conventional)','Leg Press','Calf Raise Machine (Standing)']],
      ['Light Upper',['Dumbbell Incline Press','Cable Row','Dumbbell Lateral Raise','Cable Triceps Pushdown','Dumbbell Hammer Curl']],
      ['Light Lower',['Barbell Front Squat','Romanian Deadlift','Leg Extension','Seated Leg Curl','Plank']]
    ]
  },

  // Super Squats (Strength, Intermediate)
  {
    id:'super-squats',
    name:'Super Squats',
    level:'Intermediate',
    goal:'Strength',
    duration:'45 min · 6 weeks',
    desc:'The legendary breathing squat program. 20-rep squat sets with pullovers for massive leg and lung gains.',
    days:[
      ['Workout A',['Barbell Back Squat','Barbell Pullover','Barbell Bench Press','Barbell Row']],
      ['Workout B',['Barbell Back Squat','Barbell Pullover','Overhead Press (Strict)','Barbell Deadlift (Conventional)']]
    ]
  },

  // FST-7 (Hypertrophy, Advanced)
  {
    id:'fst7',
    name:'FST-7 (Fascial Stretch Training)',
    level:'Advanced',
    goal:'Hypertrophy',
    duration:'75 min · 10 weeks',
    desc:'Hany Rambod\'s FST-7. 7 sets of 15 reps on the final exercise of each body part. Extreme pump and stretch.',
    days:[
      ['Chest & Triceps',['Barbell Bench Press','Dumbbell Incline Press','Cable Chest Fly','Cable Triceps Pushdown','EZ Bar Skull Crusher']],
      ['Back',['Barbell Deadlift (Conventional)','Barbell Row','Lat Pulldown','Cable Row','Pull-up']],
      ['Shoulders & Biceps',['Overhead Press (Strict)','Dumbbell Lateral Raise','Cable Face Pull','Barbell Curl','Dumbbell Hammer Curl']],
      ['Legs',['Barbell Back Squat','Leg Press','Leg Extension','Seated Leg Curl','Calf Raise Machine (Standing)']]
    ]
  },

  // PPLUL (Hypertrophy, Intermediate)
  {
    id:'pplul',
    name:'PPLUL (Push Pull Legs Upper Lower)',
    level:'Intermediate',
    goal:'Hypertrophy',
    duration:'60 min · 10 weeks',
    desc:'A 5-day hybrid of PPL and Upper/Lower. High frequency for maximum growth. Very popular in the fitness community.',
    days:[
      ['Push',['Barbell Bench Press','Overhead Press (Strict)','Dumbbell Incline Press','Dumbbell Lateral Raise','Cable Triceps Pushdown','Cable Chest Fly']],
      ['Pull',['Barbell Deadlift (Conventional)','Barbell Row','Lat Pulldown','Cable Face Pull','Dumbbell Curl','Dumbbell Hammer Curl']],
      ['Legs',['Barbell Back Squat','Romanian Deadlift','Leg Press','Leg Extension','Seated Leg Curl','Calf Raise Machine (Standing)']],
      ['Upper',['Barbell Bench Press','Barbell Row','Overhead Press (Strict)','Pull-up','Dumbbell Curl','Cable Triceps Pushdown']],
      ['Lower',['Barbell Front Squat','Barbell Hip Thrust','Leg Extension','Lying Leg Curl','Calf Raise Machine (Seated)','Plank']]
    ]
  },

  // Deep Water (General, Advanced)
  {
    id:'deep-water',
    name:'Deep Water',
    level:'Advanced',
    goal:'General',
    duration:'75 min · 6 weeks',
    desc:'Jon Andersen\'s Deep Water program. High volume, high intensity, minimal rest. Builds mental and physical toughness.',
    days:[
      ['Squat & Bench',['Barbell Back Squat','Barbell Bench Press','Dumbbell Row','Dumbbell Curl','Plank']],
      ['Deadlift & Press',['Barbell Deadlift (Conventional)','Overhead Press (Strict)','Pull-up','Cable Face Pull','Hanging Leg Raise']],
      ['Squat & Bench',['Barbell Back Squat','Barbell Bench Press','Barbell Row','Dumbbell Hammer Curl','Plank']],
      ['Deadlift & Press',['Barbell Deadlift (Conventional)','Overhead Press (Strict)','Lat Pulldown','Dumbbell Lateral Raise','Cable Triceps Pushdown']]
    ]
  }
];

// Helper: get unique goals
function getPlanGoals() {
  return [...new Set(PLANS.map(p => p.goal))];
}