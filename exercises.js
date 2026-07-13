// ============================================================================
// Expanded Exercise Library — 80+ exercises with simplified muscle groups
// ============================================================================
// Muscle groups: Chest, Back, Shoulders, Arms, Legs, Core
// Equipment order: Barbell, Dumbbell, Machine, Cable, Bodyweight, Kettlebell,
//                   EZ Bar, Resistance Band, Trap Bar, Sled, Medicine Ball
// ============================================================================

// Helper: map detailed muscles to simplified groups
function simplifyMuscles(detail) {
  const map = {
    'Chest': 'Chest', 'Upper chest': 'Chest', 'Lower chest': 'Chest',
    'Lats': 'Back', 'Mid back': 'Back', 'Upper back': 'Back', 'Lower back': 'Core',
    'Traps': 'Back', 'Rear delts': 'Shoulders',
    'Shoulders': 'Shoulders', 'Front delts': 'Shoulders', 'Side delts': 'Shoulders',
    'Triceps': 'Arms', 'Biceps': 'Arms', 'Brachialis': 'Arms', 'Forearms': 'Arms', 'Forearms (extensors)': 'Arms', 'Grip': 'Arms',
    'Quads': 'Legs', 'Glutes': 'Legs', 'Hamstrings': 'Legs', 'Calves': 'Legs',
    'Calves (soleus)': 'Legs', 'Calves (gastrocnemius)': 'Legs',
    'Adductors': 'Legs', 'Abductors': 'Legs', 'Adductors, Inner thighs': 'Legs', 'Glutes, Abductors': 'Legs',
    'Abs': 'Core', 'Obliques': 'Core', 'Core': 'Core', 'Hip flexors': 'Core',
    'Full body': 'Core', 'Full body, Cardio': 'Core'
  };
  const parts = detail.split(', ');
  const simplified = new Set();
  parts.forEach(p => {
    if (map[p]) simplified.add(map[p]);
    else simplified.add(p); // fallback
  });
  // Remove 'Core' if there are other muscle groups (it's often listed alongside)
  if (simplified.size > 1 && simplified.has('Core')) {
    // Only keep Core if it's the only one
    const others = [...simplified].filter(m => m !== 'Core');
    if (others.length > 0) return [...new Set(others)];
  }
  return [...simplified];
}

const EX = [
  // ── BARBELL ──────────────────────────────────────────────────────────────
  ['Barbell Back Squat','Barbell','Legs, Core'],
  ['Barbell Front Squat','Barbell','Legs, Core'],
  ['Barbell Bench Press','Barbell','Chest, Arms, Shoulders'],
  ['Barbell Incline Bench Press','Barbell','Chest, Arms, Shoulders'],
  ['Barbell Decline Bench Press','Barbell','Chest, Arms'],
  ['Barbell Row','Barbell','Back, Arms'],
  ['Barbell Pendlay Row','Barbell','Back, Arms'],
  ['Overhead Press (Strict)','Barbell','Shoulders, Arms, Core'],
  ['Push Press','Barbell','Shoulders, Arms, Legs'],
  ['Barbell Deadlift (Conventional)','Barbell','Legs, Back, Arms'],
  ['Barbell Sumo Deadlift','Barbell','Legs, Back'],
  ['Romanian Deadlift','Barbell','Legs, Core'],
  ['Barbell Hip Thrust','Barbell','Legs'],
  ['Barbell Good Morning','Barbell','Legs, Core'],
  ['Barbell Glute Bridge','Barbell','Legs'],
  ['Barbell Shrug','Barbell','Back'],
  ['Barbell Upright Row','Barbell','Back, Shoulders, Arms'],
  ['Barbell Curl','Barbell','Arms'],
  ['Barbell Skull Crusher','Barbell','Arms'],
  ['Barbell Wrist Curl','Barbell','Arms'],
  ['Barbell Reverse Wrist Curl','Barbell','Arms'],
  ['Barbell Lunges','Barbell','Legs'],
  ['Barbell Step-up','Barbell','Legs'],
  ['Barbell Calf Raise','Barbell','Legs'],
  ['Barbell Reverse Lunge','Barbell','Legs'],
  ['Barbell Floor Press','Barbell','Chest, Arms'],
  ['Barbell Pullover','Barbell','Chest, Back'],
  ['Barbell Split Squat','Barbell','Legs'],
  ['Barbell Jefferson Curl','Barbell','Legs, Core'],
  ['Barbell Landmine Press','Barbell','Shoulders, Arms, Core'],
  ['Barbell Landmine Row','Barbell','Back, Arms'],

  // ── DUMBBELL ─────────────────────────────────────────────────────────────
  ['Dumbbell Bench Press','Dumbbell','Chest, Arms'],
  ['Dumbbell Incline Press','Dumbbell','Chest, Arms, Shoulders'],
  ['Dumbbell Decline Press','Dumbbell','Chest, Arms'],
  ['Dumbbell Shoulder Press','Dumbbell','Shoulders, Arms'],
  ['Dumbbell Arnold Press','Dumbbell','Shoulders, Arms'],
  ['Dumbbell Lateral Raise','Dumbbell','Shoulders'],
  ['Dumbbell Front Raise','Dumbbell','Shoulders'],
  ['Dumbbell Rear Delt Fly','Dumbbell','Shoulders, Back'],
  ['Dumbbell Row','Dumbbell','Back, Arms'],
  ['Dumbbell Pullover','Dumbbell','Chest, Back'],
  ['Dumbbell Curl','Dumbbell','Arms'],
  ['Dumbbell Hammer Curl','Dumbbell','Arms'],
  ['Dumbbell Concentration Curl','Dumbbell','Arms'],
  ['Dumbbell Triceps Extension','Dumbbell','Arms'],
  ['Dumbbell Overhead Triceps Extension','Dumbbell','Arms'],
  ['Dumbbell Kickback','Dumbbell','Arms'],
  ['Dumbbell Bulgarian Split Squat','Dumbbell','Legs'],
  ['Dumbbell Goblet Squat','Dumbbell','Legs, Core'],
  ['Dumbbell Lunges','Dumbbell','Legs'],
  ['Dumbbell Romanian Deadlift','Dumbbell','Legs'],
  ['Dumbbell Hip Thrust','Dumbbell','Legs'],
  ['Dumbbell Calf Raise','Dumbbell','Legs'],
  ['Dumbbell Shrug','Dumbbell','Back'],
  ['Dumbbell Russian Twist','Dumbbell','Core'],
  ['Dumbbell Floor Press','Dumbbell','Chest, Arms'],
  ['Dumbbell Farmer Walk','Dumbbell','Arms, Back, Core'],
  ['Dumbbell Step-up','Dumbbell','Legs'],
  ['Dumbbell Reverse Fly','Dumbbell','Shoulders, Back'],
  ['Dumbbell Chest Fly','Dumbbell','Chest'],
  ['Dumbbell Incline Fly','Dumbbell','Chest'],
  ['Dumbbell Wrist Curl','Dumbbell','Arms'],
  ['Dumbbell Pullover','Dumbbell','Chest, Back'],

  // ── MACHINE ──────────────────────────────────────────────────────────────
  ['Leg Press','Machine','Legs'],
  ['Leg Extension','Machine','Legs'],
  ['Seated Leg Curl','Machine','Legs'],
  ['Lying Leg Curl','Machine','Legs'],
  ['Chest Press Machine','Machine','Chest, Arms'],
  ['Incline Chest Press Machine','Machine','Chest, Arms'],
  ['Pec Deck (Chest Fly Machine)','Machine','Chest'],
  ['Lat Pulldown','Machine','Back, Arms'],
  ['Close-grip Lat Pulldown','Machine','Back, Arms'],
  ['Reverse-grip Lat Pulldown','Machine','Back, Arms'],
  ['Seated Row Machine','Machine','Back, Arms'],
  ['Chest Supported Row Machine','Machine','Back, Arms'],
  ['Hack Squat','Machine','Legs'],
  ['Calf Raise Machine (Seated)','Machine','Legs'],
  ['Calf Raise Machine (Standing)','Machine','Legs'],
  ['Shoulder Press Machine','Machine','Shoulders, Arms'],
  ['Lateral Raise Machine','Machine','Shoulders'],
  ['Reverse Fly Machine','Machine','Shoulders, Back'],
  ['Triceps Pushdown Machine','Machine','Arms'],
  ['Biceps Curl Machine','Machine','Arms'],
  ['Leg Press Calf Raise','Machine','Legs'],
  ['Adductor Machine','Machine','Legs'],
  ['Abductor Machine','Machine','Legs'],
  ['Hyperextension Bench','Machine','Core, Legs'],
  ['Back Extension (Roman Chair)','Machine','Core, Legs'],
  ['Rotary Torso Machine','Machine','Core'],
  ['Smith Machine Squat','Machine','Legs'],
  ['Smith Machine Bench Press','Machine','Chest, Arms'],
  ['Smith Machine Shoulder Press','Machine','Shoulders, Arms'],
  ['Smith Machine Hip Thrust','Machine','Legs'],

  // ── CABLE ────────────────────────────────────────────────────────────────
  ['Cable Row','Cable','Back, Arms'],
  ['Cable Face Pull','Cable','Shoulders, Back'],
  ['Cable Triceps Pushdown','Cable','Arms'],
  ['Cable Overhead Triceps Extension','Cable','Arms'],
  ['Cable Biceps Curl','Cable','Arms'],
  ['Cable Hammer Curl','Cable','Arms'],
  ['Cable Chest Fly','Cable','Chest'],
  ['Cable Incline Fly','Cable','Chest'],
  ['Cable Lateral Raise','Cable','Shoulders'],
  ['Cable Front Raise','Cable','Shoulders'],
  ['Cable Pull-through','Cable','Legs'],
  ['Cable Hip Adduction','Cable','Legs'],
  ['Cable Hip Abduction','Cable','Legs'],
  ['Cable Crunch','Cable','Core'],
  ['Cable Woodchop','Cable','Core'],
  ['Cable Reverse Fly','Cable','Shoulders, Back'],
  ['Cable Pullover','Cable','Back, Chest'],
  ['Cable Upright Row','Cable','Back, Shoulders, Arms'],
  ['Cable Shrug','Cable','Back'],
  ['Cable Wrist Curl','Cable','Arms'],
  ['Cable Straight Arm Pulldown','Cable','Back'],
  ['Cable Kickback','Cable','Legs'],
  ['Cable Lying Leg Curl','Cable','Legs'],

  // ── BODYWEIGHT ───────────────────────────────────────────────────────────
  ['Pull-up','Bodyweight','Back, Arms'],
  ['Chin-up','Bodyweight','Back, Arms'],
  ['Wide-grip Pull-up','Bodyweight','Back, Arms'],
  ['Push-up','Bodyweight','Chest, Arms, Shoulders'],
  ['Decline Push-up','Bodyweight','Chest, Arms, Shoulders'],
  ['Incline Push-up','Bodyweight','Chest, Arms'],
  ['Diamond Push-up','Bodyweight','Arms, Chest'],
  ['Dip','Bodyweight','Chest, Arms, Shoulders'],
  ['Hanging Leg Raise','Bodyweight','Core'],
  ['Plank','Bodyweight','Core'],
  ['Side Plank','Bodyweight','Core'],
  ['Walking Lunge','Bodyweight','Legs'],
  ['Bodyweight Squat','Bodyweight','Legs'],
  ['Bulgarian Split Squat (Bodyweight)','Bodyweight','Legs'],
  ['Glute Bridge','Bodyweight','Legs'],
  ['Single-leg Glute Bridge','Bodyweight','Legs'],
  ['Calf Raise (Bodyweight)','Bodyweight','Legs'],
  ['Pike Push-up','Bodyweight','Shoulders, Arms'],
  ['Burpee','Bodyweight','Legs, Core, Arms'],
  ['Mountain Climber','Bodyweight','Core, Legs'],
  ['Jump Squat','Bodyweight','Legs'],
  ['Box Jump','Bodyweight','Legs'],
  ['Step-up (Bodyweight)','Bodyweight','Legs'],
  ['Triceps Dip (Bench)','Bodyweight','Arms'],
  ['Australian Row (Inverted Row)','Bodyweight','Back, Arms'],
  ['Archer Push-up','Bodyweight','Chest, Arms'],
  ['Pistol Squat','Bodyweight','Legs'],
  ['Nordic Hamstring Curl','Bodyweight','Legs'],
  ['Superman Hold','Bodyweight','Core, Back'],
  ['Bird Dog','Bodyweight','Core'],
  ['Dead Bug','Bodyweight','Core'],
  ['Bicycle Crunch','Bodyweight','Core'],
  ['Toes to Bar','Bodyweight','Core, Arms'],
  ['L-sit','Bodyweight','Core, Arms'],
  ['Handstand Push-up','Bodyweight','Shoulders, Arms'],

  // ── KETTLEBELL ───────────────────────────────────────────────────────────
  ['Kettlebell Swing','Kettlebell','Legs, Core, Back'],
  ['Kettlebell Goblet Squat','Kettlebell','Legs, Core'],
  ['Kettlebell Clean','Kettlebell','Legs, Back, Shoulders'],
  ['Kettlebell Snatch','Kettlebell','Legs, Shoulders, Core'],
  ['Kettlebell Turkish Get-up','Kettlebell','Core, Shoulders, Legs'],
  ['Kettlebell Press','Kettlebell','Shoulders, Arms'],
  ['Kettlebell Row','Kettlebell','Back, Arms'],
  ['Kettlebell Windmill','Kettlebell','Core, Legs, Shoulders'],
  ['Kettlebell Figure 8','Kettlebell','Core, Legs'],
  ['Kettlebell Single-leg Deadlift','Kettlebell','Legs, Core'],
  ['Kettlebell Farmer Carry','Kettlebell','Arms, Core, Back'],
  ['Kettlebell Thruster','Kettlebell','Legs, Shoulders'],
  ['Kettlebell Russian Twist','Kettlebell','Core'],
  ['Kettlebell Halo','Kettlebell','Shoulders, Core'],
  ['Kettlebell Cossack Squat','Kettlebell','Legs'],

  // ── EZ BAR ───────────────────────────────────────────────────────────────
  ['EZ Bar Curl','EZ Bar','Arms'],
  ['EZ Bar Preacher Curl','EZ Bar','Arms'],
  ['EZ Bar Skull Crusher','EZ Bar','Arms'],
  ['EZ Bar Overhead Triceps Extension','EZ Bar','Arms'],
  ['EZ Bar Pullover','EZ Bar','Chest, Back'],
  ['EZ Bar Upright Row','EZ Bar','Back, Shoulders, Arms'],
  ['EZ Bar Reverse Curl','EZ Bar','Arms'],
  ['EZ Bar Wrist Curl','EZ Bar','Arms'],

  // ── RESISTANCE BAND ──────────────────────────────────────────────────────
  ['Band Pull-apart','Resistance Band','Shoulders, Back'],
  ['Band Face Pull','Resistance Band','Shoulders, Back'],
  ['Band Lateral Walk','Resistance Band','Legs'],
  ['Band Glute Bridge','Resistance Band','Legs'],
  ['Band Clamshell','Resistance Band','Legs'],
  ['Band Triceps Pushdown','Resistance Band','Arms'],
  ['Band Biceps Curl','Resistance Band','Arms'],
  ['Band Overhead Press','Resistance Band','Shoulders, Arms'],
  ['Band Row','Resistance Band','Back'],
  ['Band Chest Fly','Resistance Band','Chest'],
  ['Band Pallof Press','Resistance Band','Core'],
  ['Band Monster Walk','Resistance Band','Legs'],

  // ── TRAP BAR ─────────────────────────────────────────────────────────────
  ['Trap Bar Deadlift','Trap Bar','Legs, Back'],
  ['Trap Bar Shrug','Trap Bar','Back'],
  ['Trap Bar Farmer Walk','Trap Bar','Arms, Core, Back'],
  ['Trap Bar Calf Raise','Trap Bar','Legs'],
  ['Trap Bar Row','Trap Bar','Back, Arms'],
  ['Trap Bar Jump','Trap Bar','Legs'],

  // ── SLED ─────────────────────────────────────────────────────────────────
  ['Sled Push','Sled','Legs, Core'],
  ['Sled Pull','Sled','Legs, Back, Arms'],
  ['Sled Drag (Backward)','Sled','Legs'],
  ['Sled Lateral Drag','Sled','Legs'],

  // ── MEDICINE BALL ────────────────────────────────────────────────────────
  ['Medicine Ball Slam','Medicine Ball','Core, Arms, Legs'],
  ['Medicine Ball Russian Twist','Medicine Ball','Core'],
  ['Medicine Ball Wall Ball','Medicine Ball','Legs, Shoulders'],
  ['Medicine Ball Chest Pass','Medicine Ball','Chest, Arms'],
  ['Medicine Ball Overhead Throw','Medicine Ball','Shoulders, Arms, Core'],
  ['Medicine Ball Rotational Throw','Medicine Ball','Core'],
].map((x,i)=>({id:`e${i}`,name:x[0],category:x[1],muscles:x[2].split(', ')}));

// Helper functions
const byName = n => EX.find(x => x.name === n)?.id;
const byId = id => EX.find(x => x.id === id);

// Custom order: most common in gyms → least common
const EQUIPMENT_ORDER = ['Barbell','Dumbbell','Machine','Cable','Bodyweight','Kettlebell','EZ Bar','Resistance Band','Trap Bar','Sled','Medicine Ball'];

const getMuscleGroups = () => ['Chest','Back','Shoulders','Arms','Legs','Core'];
const getEquipmentTypes = () => EQUIPMENT_ORDER;
const getExercisesByMuscle = muscle => EX.filter(e => e.muscles.includes(muscle));
const getExercisesByEquipment = equip => EX.filter(e => e.category === equip);