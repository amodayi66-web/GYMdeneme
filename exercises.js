// ============================================================================
// Exercise Library — 80+ exercises with GIF URLs
// Each object: { id, name, category, muscles: [], gifUrl }
// GIF source: https://github.com/yuhonas/free-exercise-db
// ============================================================================

const _EX_RAW = [
  // ── BARBELL ──────────────────────────────────────────────────────────────
  ['Barbell Back Squat','Barbell','Legs, Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/BarbellSquat/gifs/BarbellSquat.gif'],
  ['Barbell Front Squat','Barbell','Legs, Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/FrontSquat/gifs/FrontSquat.gif'],
  ['Barbell Bench Press','Barbell','Chest, Arms, Shoulders','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/BenchPress/gifs/BenchPress.gif'],
  ['Barbell Incline Bench Press','Barbell','Chest, Arms, Shoulders','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/InclineBenchPress/gifs/InclineBenchPress.gif'],
  ['Barbell Decline Bench Press','Barbell','Chest, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DeclineBenchPress/gifs/DeclineBenchPress.gif'],
  ['Barbell Row','Barbell','Back, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/BarbellRow/gifs/BarbellRow.gif'],
  ['Barbell Pendlay Row','Barbell','Back, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/PendlayRow/gifs/PendlayRow.gif'],
  ['Overhead Press (Strict)','Barbell','Shoulders, Arms, Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/OverheadPress/gifs/OverheadPress.gif'],
  ['Push Press','Barbell','Shoulders, Arms, Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/PushPress/gifs/PushPress.gif'],
  ['Barbell Deadlift (Conventional)','Barbell','Legs, Back, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Deadlift/gifs/Deadlift.gif'],
  ['Barbell Sumo Deadlift','Barbell','Legs, Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/SumoDeadlift/gifs/SumoDeadlift.gif'],
  ['Romanian Deadlift','Barbell','Legs, Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/RomanianDeadlift/gifs/RomanianDeadlift.gif'],
  ['Barbell Hip Thrust','Barbell','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/HipThrust/gifs/HipThrust.gif'],
  ['Barbell Good Morning','Barbell','Legs, Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/GoodMorning/gifs/GoodMorning.gif'],
  ['Barbell Shrug','Barbell','Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/BarbellShrug/gifs/BarbellShrug.gif'],
  ['Barbell Upright Row','Barbell','Back, Shoulders, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/UprightRow/gifs/UprightRow.gif'],
  ['Barbell Curl','Barbell','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/BarbellCurl/gifs/BarbellCurl.gif'],
  ['Barbell Skull Crusher','Barbell','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/SkullCrusher/gifs/SkullCrusher.gif'],
  ['Barbell Lunges','Barbell','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/BarbellLunge/gifs/BarbellLunge.gif'],
  ['Barbell Step-up','Barbell','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/StepUp/gifs/StepUp.gif'],
  ['Barbell Calf Raise','Barbell','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/BarbellCalfRaise/gifs/BarbellCalfRaise.gif'],
  ['Barbell Floor Press','Barbell','Chest, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/FloorPress/gifs/FloorPress.gif'],
  ['Barbell Pullover','Barbell','Chest, Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/BarbellPullover/gifs/BarbellPullover.gif'],
  ['Barbell Split Squat','Barbell','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/BulgarianSplitSquat/gifs/BulgarianSplitSquat.gif'],
  ['Barbell Landmine Press','Barbell','Shoulders, Arms, Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/LandminePress/gifs/LandminePress.gif'],
  ['Barbell Landmine Row','Barbell','Back, Arms',''],
  ['Barbell Glute Bridge','Barbell','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/GluteBridge/gifs/GluteBridge.gif'],
  ['Barbell Reverse Lunge','Barbell','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/ReverseLunge/gifs/ReverseLunge.gif'],
  ['Barbell Jefferson Curl','Barbell','Legs, Core',''],
  ['Barbell Wrist Curl','Barbell','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/WristCurl/gifs/WristCurl.gif'],
  ['Barbell Reverse Wrist Curl','Barbell','Arms',''],

  // ── DUMBBELL ─────────────────────────────────────────────────────────────
  ['Dumbbell Bench Press','Dumbbell','Chest, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DumbbellBenchPress/gifs/DumbbellBenchPress.gif'],
  ['Dumbbell Incline Press','Dumbbell','Chest, Arms, Shoulders','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DumbbellInclineBenchPress/gifs/DumbbellInclineBenchPress.gif'],
  ['Dumbbell Shoulder Press','Dumbbell','Shoulders, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DumbbellShoulderPress/gifs/DumbbellShoulderPress.gif'],
  ['Dumbbell Arnold Press','Dumbbell','Shoulders, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/ArnoldPress/gifs/ArnoldPress.gif'],
  ['Dumbbell Lateral Raise','Dumbbell','Shoulders','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DumbbellLateralRaise/gifs/DumbbellLateralRaise.gif'],
  ['Dumbbell Front Raise','Dumbbell','Shoulders','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DumbbellFrontRaise/gifs/DumbbellFrontRaise.gif'],
  ['Dumbbell Rear Delt Fly','Dumbbell','Shoulders, Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DumbbellRearDeltFly/gifs/DumbbellRearDeltFly.gif'],
  ['Dumbbell Row','Dumbbell','Back, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DumbbellRow/gifs/DumbbellRow.gif'],
  ['Dumbbell Pullover','Dumbbell','Chest, Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DumbbellPullover/gifs/DumbbellPullover.gif'],
  ['Dumbbell Curl','Dumbbell','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DumbbellCurl/gifs/DumbbellCurl.gif'],
  ['Dumbbell Hammer Curl','Dumbbell','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DumbbellHammerCurl/gifs/DumbbellHammerCurl.gif'],
  ['Dumbbell Concentration Curl','Dumbbell','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/ConcentrationCurl/gifs/ConcentrationCurl.gif'],
  ['Dumbbell Triceps Extension','Dumbbell','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DumbbellTricepsExtension/gifs/DumbbellTricepsExtension.gif'],
  ['Dumbbell Kickback','Dumbbell','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DumbbellKickback/gifs/DumbbellKickback.gif'],
  ['Dumbbell Bulgarian Split Squat','Dumbbell','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/BulgarianSplitSquat/gifs/BulgarianSplitSquat.gif'],
  ['Dumbbell Goblet Squat','Dumbbell','Legs, Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/GobletSquat/gifs/GobletSquat.gif'],
  ['Dumbbell Lunges','Dumbbell','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DumbbellLunge/gifs/DumbbellLunge.gif'],
  ['Dumbbell Romanian Deadlift','Dumbbell','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DumbbellRomanianDeadlift/gifs/DumbbellRomanianDeadlift.gif'],
  ['Dumbbell Hip Thrust','Dumbbell','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/HipThrust/gifs/HipThrust.gif'],
  ['Dumbbell Calf Raise','Dumbbell','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DumbbellCalfRaise/gifs/DumbbellCalfRaise.gif'],
  ['Dumbbell Shrug','Dumbbell','Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DumbbellShrug/gifs/DumbbellShrug.gif'],
  ['Dumbbell Russian Twist','Dumbbell','Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/RussianTwist/gifs/RussianTwist.gif'],
  ['Dumbbell Floor Press','Dumbbell','Chest, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DumbbellFloorPress/gifs/DumbbellFloorPress.gif'],
  ['Dumbbell Farmer Walk','Dumbbell','Arms, Back, Core',''],
  ['Dumbbell Step-up','Dumbbell','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/StepUp/gifs/StepUp.gif'],
  ['Dumbbell Reverse Fly','Dumbbell','Shoulders, Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/ReverseFly/gifs/ReverseFly.gif'],
  ['Dumbbell Overhead Triceps Extension','Dumbbell','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/OverheadTricepsExtension/gifs/OverheadTricepsExtension.gif'],
  ['Dumbbell Decline Press','Dumbbell','Chest, Arms',''],
  ['Dumbbell Chest Fly','Dumbbell','Chest','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/DumbbellFly/gifs/DumbbellFly.gif'],

  // ── MACHINE ──────────────────────────────────────────────────────────────
  ['Machine Chest Press','Machine','Chest, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/ChestPressMachine/gifs/ChestPressMachine.gif'],
  ['Machine Shoulder Press','Machine','Shoulders, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/ShoulderPressMachine/gifs/ShoulderPressMachine.gif'],
  ['Machine Lat Pulldown','Machine','Back, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/LatPulldown/gifs/LatPulldown.gif'],
  ['Machine Seated Row','Machine','Back, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/SeatedCableRow/gifs/SeatedCableRow.gif'],
  ['Machine Leg Press','Machine','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/LegPress/gifs/LegPress.gif'],
  ['Machine Leg Extension','Machine','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/LegExtension/gifs/LegExtension.gif'],
  ['Machine Leg Curl','Machine','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/LegCurl/gifs/LegCurl.gif'],
  ['Machine Chest Fly','Machine','Chest','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/PecDeckFly/gifs/PecDeckFly.gif'],
  ['Machine Lateral Raise','Machine','Shoulders',''],
  ['Machine Calf Raise','Machine','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/CalfRaiseOnLegPress/gifs/CalfRaiseOnLegPress.gif'],
  ['Machine Biceps Curl','Machine','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/MachineBicepCurl/gifs/MachineBicepCurl.gif'],
  ['Machine Triceps Extension','Machine','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/TricepsPushdown/gifs/TricepsPushdown.gif'],
  ['Machine Hack Squat','Machine','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/HackSquat/gifs/HackSquat.gif'],
  ['Machine Glute Kickback','Machine','Legs',''],

  // ── CABLE ────────────────────────────────────────────────────────────────
  ['Cable Chest Fly','Cable','Chest','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/CableChestFly/gifs/CableChestFly.gif'],
  ['Cable Lateral Raise','Cable','Shoulders','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/CableLateralRaise/gifs/CableLateralRaise.gif'],
  ['Cable Face Pull','Cable','Shoulders, Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/FacePull/gifs/FacePull.gif'],
  ['Cable Triceps Pushdown','Cable','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/TricepsPushdown/gifs/TricepsPushdown.gif'],
  ['Cable Biceps Curl','Cable','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/CableBicepCurl/gifs/CableBicepCurl.gif'],
  ['Cable Seated Row','Cable','Back, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/SeatedCableRow/gifs/SeatedCableRow.gif'],
  ['Cable Lat Pulldown','Cable','Back, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/LatPulldown/gifs/LatPulldown.gif'],
  ['Cable Pull-through','Cable','Legs, Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/CablePullThrough/gifs/CablePullThrough.gif'],
  ['Cable Woodchop','Cable','Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/WoodChop/gifs/WoodChop.gif'],
  ['Cable Overhead Triceps Extension','Cable','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/OverheadTricepsExtension/gifs/OverheadTricepsExtension.gif'],
  ['Cable Hip Adduction','Cable','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/CableHipAdduction/gifs/CableHipAdduction.gif'],
  ['Cable Hip Abduction','Cable','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/CableHipAbduction/gifs/CableHipAbduction.gif'],
  ['Cable Crunch','Cable','Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/CableCrunch/gifs/CableCrunch.gif'],
  ['Cable Rear Delt Fly','Cable','Shoulders, Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/ReverseFly/gifs/ReverseFly.gif'],

  // ── BODYWEIGHT ───────────────────────────────────────────────────────────
  ['Pushup','Bodyweight','Chest, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/PushUp/gifs/PushUp.gif'],
  ['Pull-up','Bodyweight','Back, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/PullUp/gifs/PullUp.gif'],
  ['Chin-up','Bodyweight','Back, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/ChinUp/gifs/ChinUp.gif'],
  ['Dip','Bodyweight','Chest, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/TricepsDip/gifs/TricepsDip.gif'],
  ['Bodyweight Squat','Bodyweight','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/BodyweightSquat/gifs/BodyweightSquat.gif'],
  ['Lunge','Bodyweight','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lunge/gifs/Lunge.gif'],
  ['Plank','Bodyweight','Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/gifs/Plank.gif'],
  ['Crunch','Bodyweight','Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunch/gifs/Crunch.gif'],
  ['Glute Bridge','Bodyweight','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/GluteBridge/gifs/GluteBridge.gif'],
  ['Calf Raise','Bodyweight','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/CalfRaise/gifs/CalfRaise.gif'],
  ['Burpee','Bodyweight','Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Burpee/gifs/Burpee.gif'],
  ['Mountain Climber','Bodyweight','Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/MountainClimbers/gifs/MountainClimbers.gif'],
  ['Bicycle Crunch','Bodyweight','Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/BicycleCrunch/gifs/BicycleCrunch.gif'],
  ['Wall Sit','Bodyweight','Legs',''],
  ['Inverted Row','Bodyweight','Back, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/InvertedRow/gifs/InvertedRow.gif'],
  ['Pike Pushup','Bodyweight','Shoulders, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/PikePushUp/gifs/PikePushUp.gif'],

  // ── KETTLEBELL ───────────────────────────────────────────────────────────
  ['Kettlebell Swing','Kettlebell','Legs, Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/KettlebellSwing/gifs/KettlebellSwing.gif'],
  ['Kettlebell Goblet Squat','Kettlebell','Legs, Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/GobletSquat/gifs/GobletSquat.gif'],
  ['Kettlebell Clean','Kettlebell','Legs, Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/KettlebellClean/gifs/KettlebellClean.gif'],
  ['Kettlebell Snatch','Kettlebell','Shoulders, Legs, Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/KettlebellSnatch/gifs/KettlebellSnatch.gif'],
  ['Kettlebell Turkish Get-up','Kettlebell','Core, Shoulders','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/TurkishGetUp/gifs/TurkishGetUp.gif'],
  ['Kettlebell Windmill','Kettlebell','Core, Shoulders','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/KettlebellWindmill/gifs/KettlebellWindmill.gif'],
  ['Kettlebell Row','Kettlebell','Back, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/KettlebellRow/gifs/KettlebellRow.gif'],
  ['Kettlebell Press','Kettlebell','Shoulders, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/KettlebellShoulderPress/gifs/KettlebellShoulderPress.gif'],
  ['Kettlebell Deadlift','Kettlebell','Legs, Core',''],

  // ── EZ BAR ───────────────────────────────────────────────────────────────
  ['EZ Bar Curl','EZ Bar','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/BarbellCurl/gifs/BarbellCurl.gif'],
  ['EZ Bar Skull Crusher','EZ Bar','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/SkullCrusher/gifs/SkullCrusher.gif'],
  ['EZ Bar Pullover','EZ Bar','Chest, Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/BarbellPullover/gifs/BarbellPullover.gif'],

  // ── RESISTANCE BAND ──────────────────────────────────────────────────────
  ['Band Pull-apart','Resistance Band','Shoulders, Back',''],
  ['Band Lateral Walk','Resistance Band','Legs',''],
  ['Band Face Pull','Resistance Band','Shoulders, Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/FacePull/gifs/FacePull.gif'],
  ['Band Triceps Pushdown','Resistance Band','Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/TricepsPushdown/gifs/TricepsPushdown.gif'],

  // ── TRAP BAR ─────────────────────────────────────────────────────────────
  ['Trap Bar Deadlift','Trap Bar','Legs, Back, Arms','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Deadlift/gifs/Deadlift.gif'],
  ['Trap Bar Shrug','Trap Bar','Back','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/BarbellShrug/gifs/BarbellShrug.gif'],
  ['Trap Bar Farmer Walk','Trap Bar','Arms, Back, Core',''],

  // ── SLED ─────────────────────────────────────────────────────────────────
  ['Sled Push','Sled','Legs','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/SledPush/gifs/SledPush.gif'],
  ['Sled Pull','Sled','Legs, Back',''],
  ['Sled Drag','Sled','Legs, Core',''],

  // ── MEDICINE BALL ────────────────────────────────────────────────────────
  ['Medicine Ball Slam','Medicine Ball','Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/MedicineBallSlam/gifs/MedicineBallSlam.gif'],
  ['Medicine Ball Wall Ball','Medicine Ball','Legs, Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/WallBall/gifs/WallBall.gif'],
  ['Medicine Ball Russian Twist','Medicine Ball','Core','https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/RussianTwist/gifs/RussianTwist.gif'],
  ['Medicine Ball Chest Pass','Medicine Ball','Chest, Arms',''],
];

// Build EX as objects, keeping old array format for backward compat
// Each has: id, name, category, muscles:[], gifUrl
const EX = _EX_RAW.map(e => ({
  id: e[0].replace(/[^a-zA-Z0-9]/g,'').toLowerCase(),
  name: e[0],
  category: e[1],
  muscles: e[2].split(', '),
  gifUrl: e[3] || ''
}));

const getMuscleGroups = () => ['Chest','Back','Shoulders','Arms','Legs','Core'];
const getEquipmentTypes = () => ['Barbell','Dumbbell','Machine','Cable','Bodyweight','Kettlebell','EZ Bar','Resistance Band','Trap Bar','Sled','Medicine Ball'];
const getExercisesByMuscle = muscle => EX.filter(e => e.muscles.includes(muscle));
const getExercisesByEquipment = equip => EX.filter(e => e.category === equip);
const byId = id => EX.find(e => e.id === id);
const byName = name => { const e = EX.find(x => x.name === name); return e ? e.id : null; };
