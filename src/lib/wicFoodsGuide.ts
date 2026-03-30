export interface ApprovedBrand {
  brand: string;
  products: string[];
}

export interface WicFoodSubCategory {
  id: string;
  name: string;
  approved: string[];
  doNotBuy: string[];
  shoppingTips: string[];
  approvedBrands: ApprovedBrand[];
}

export interface WicFoodCategory {
  id: string;
  name: string;
  icon: string;
  subCategories: WicFoodSubCategory[];
}

export const WIC_FOODS_GUIDE: WicFoodCategory[] = [
  {
    id: 'dairy-soy',
    name: 'Dairy/Soy',
    icon: 'Milk',
    subCategories: [
      {
        id: 'milk',
        name: 'Milk',
        approved: [
          '32 oz, 64 oz, 96 oz, 128 oz',
          'Quart, half gallon, 3/4 gallon, gallon',
          'Any brand',
          'Cow\'s milk: Buy the largest container available when possible',
          'Lactose-free milk: Buy the largest container available when possible',
          'Goat milk: Meyenberg 12 oz container only',
          'Evaporated/Canned milk: 12 oz container only',
          'Powdered/Dry milk: 25.6 oz container only',
          'Kosher milk: If printed on your WIC Shopping List',
        ],
        doNotBuy: [
          'Flavored',
          'Organic',
          'Sweetened or condensed',
          'Buttermilk',
          'Added calcium',
          'Reduced fat (2%) milk',
        ],
        shoppingTips: [
          'Your WIC Shopping List shows the fat content and type of milk you must buy',
          'Buy the largest container available when possible',
        ],
        approvedBrands: [],
      },
      {
        id: 'cheese',
        name: 'Cheese',
        approved: [
          '8, 16, 24, or 32 oz packages only',
          'Any brand',
          'Blocks or Slices',
          'Pasteurized Process American, Monterey Jack, Mozzarella, Cheddar, Colby, Swiss, Muenster, Provolone, or blends',
          'Kosher (Cholov Yisroel) cheese if printed on your WIC Shopping List',
        ],
        doNotBuy: [
          'Imported cheese',
          'Cheese foods, products, or spreads',
          'Cracker cuts',
          'Shredded/grated/cubed, string, or stick cheese',
          'Flavored cheese',
          'Organic cheese',
          'Individually wrapped cheese',
          'Deli cheese',
        ],
        shoppingTips: [],
        approvedBrands: [],
      },
      {
        id: 'soy-beverages',
        name: 'Soy Beverages',
        approved: [
          'Check your WIC Shopping List for soy beverage eligibility',
        ],
        doNotBuy: [],
        shoppingTips: [
          'Check your WIC Shopping List for soy beverage eligibility',
        ],
        approvedBrands: [
          { brand: '8th Continent', products: ['Original Soymilk 64 oz', 'Vanilla Soymilk 64 oz'] },
          { brand: 'Bettergoods', products: ['Original Soymilk 64 oz'] },
          { brand: 'Great Value', products: ['Original Soymilk 64 oz'] },
          { brand: 'Pacific Foods', products: ['Ultra Soy Original Soymilk 32 oz', 'Ultra Soy Vanilla Soymilk 32 oz'] },
          { brand: 'Silk', products: ['Original Aseptic Soymilk 32 oz', 'Original Plain Soymilk 2 pack 64 oz', 'Original Plain Soymilk 3 pack 64 oz', 'Silk Soymilk 32 oz', 'Silk Soymilk 64 oz', 'Silk Unsweetened Soymilk 64 oz', 'Silk Vanilla Soymilk 32 oz', 'Silk Vanilla Soymilk 64 oz'] },
        ],
      },
      {
        id: 'yogurt',
        name: 'Yogurt',
        approved: [
          '32 ounce containers only',
          'Fat content listed on your WIC Shopping List',
        ],
        doNotBuy: [
          'Mix-in ingredients (granola, candy, etc.)',
          'Drinkable/Squeezable',
          'Frozen yogurt',
          'Artificial sweeteners',
        ],
        shoppingTips: [
          'Whole milk: Children 12-24 months',
          'Low-fat and nonfat: Women and children 2-5 years',
          'Check your family\'s WIC Shopping List for the type and amount of yogurt you can buy',
        ],
        approvedBrands: [
          { brand: 'Arz', products: ['Original Whole Fat Plain'] },
          { brand: 'Axelrod', products: ['Whole Plain', 'Lowfat Plain', 'Nonfat Plain'] },
          { brand: 'Best Choice', products: ['Whole Milk Plain Greek', 'Lowfat Original Strawberry', 'Lowfat Original Vanilla', 'Nonfat Original Plain', 'Nonfat Plain Greek', 'Nonfat Vanilla Greek'] },
          { brand: 'Bettergoods', products: ['Whole Milk Plain Greek'] },
          { brand: 'Bowl and Basket', products: ['Whole Plain Greek', 'Lowfat Plain', 'Nonfat Plain Greek', 'Nonfat Plain', 'Nonfat Vanilla Greek', 'Nonfat Vanilla'] },
          { brand: 'Brown Cow', products: ['Cream on the Top Whole Fat Plain', 'Whole Milk Vanilla', 'Whole Milk Maple', 'Lowfat Plain', 'Nonfat Plain'] },
          { brand: 'Cabot', products: ['Whole Fat Plain', '2% Lowfat Plain', 'Nonfat Plain'] },
          { brand: 'Chobani', products: ['Whole Fat Plain Greek', '2% Lowfat Plain Greek', 'Nonfat Plain Greek', 'Nonfat Strawberry Greek', 'Nonfat Vanilla Greek'] },
          { brand: 'Dannon', products: ['Whole Fat Plain', 'Whole Milk Vanilla', '1.5% Lowfat Plain', 'Nonfat Plain Greek', 'Nonfat Plain'] },
          { brand: 'Essential Everyday', products: ['Whole Fat Plain', 'Whole Plain Greek', 'Lowfat Plain', 'Nonfat Plain Greek', 'Nonfat Plain'] },
          { brand: 'Fage', products: ['Nonfat Plain Greek', '2% Lowfat Plain'] },
          { brand: 'Great Value', products: ['Whole Fat Plain Greek', 'Nonfat Plain Greek', 'Nonfat Plain', 'Nonfat Vanilla Greek'] },
          { brand: 'Green Mountain Creamery', products: ['Plain Greek', 'Whole Plain', 'Nonfat Plain', 'Nonfat Plain Greek'] },
          { brand: 'Hannaford', products: ['Whole Milk Plain', 'Whole Vanilla Greek', 'Greek Nonfat Plain', 'Lowfat Plain', 'Nonfat Plain'] },
          { brand: 'Horizon', products: ['Organic Whole Fat Plain', 'Nonfat Plain', 'Organic Nonfat Plain'] },
          { brand: 'La Yogurt', products: ['Whole Fat Plain', 'Whole Milk Strawberry', 'Lowfat Plain', 'Nonfat Plain'] },
          { brand: 'Mountain High', products: ['Original Whole Fat Plain', 'Lowfat Plain', 'Nonfat Plain'] },
          { brand: 'Nancy\'s', products: ['Organic Probiotic Whole Plain', 'Whole Plain', 'Nonfat Plain', 'Organic Lowfat Plain'] },
          { brand: 'Nature\'s Promise', products: ['Organic Whole Milk Vanilla', 'Organic Whole Plain Greek', 'Organic Whole Plain', 'Organic Greek Nonfat Plain', 'Organic Nonfat Plain'] },
          { brand: 'O Organics', products: ['Organic Whole Milk Plain', 'Nonfat Plain Greek', 'Nonfat Vanilla Greek'] },
          { brand: 'Oikos', products: ['Whole Fat Plain Greek', 'Nonfat Plain Greek', 'Nonfat Vanilla Greek', 'Pro Lowfat Plain'] },
          { brand: 'Open Nature', products: ['Whole Fat Plain Greek', '2% Plain Greek', 'Nonfat Plain Greek'] },
          { brand: 'PICs', products: ['Plain Greek', 'Whole Fat Plain', 'Whole Plain Greek', 'Lowfat Plain', 'Nonfat Plain Greek', 'Nonfat Plain'] },
          { brand: 'Shop Rite', products: ['Whole Fat Plain', 'Whole Plain Greek', 'Lowfat Plain', 'Nonfat Plain Greek', 'Nonfat Plain'] },
          { brand: 'Stonyfield Organic', products: ['Whole Strawberry', 'Whole Fat Plain', 'Whole Milk Banilla', 'Creamy Lowfat Plain', 'Nonfat Plain Greek', 'Nonfat Plain'] },
          { brand: 'Stop and Shop', products: ['Greek Whole Fat Plain', 'Whole Vanilla Greek', 'Greek Nonfat Plain', 'Lowfat Plain', 'Nonfat Plain'] },
          { brand: 'Tops', products: ['Whole Milk Plain', 'Whole Milk Vanilla', 'Lowfat Plain', 'Nonfat Plain', 'Nonfat Plain Greek'] },
          { brand: 'Wegmans', products: ['Organic Whole Plain Greek', 'Whole Fat Plain', 'Whole Fat Vanilla Greek', 'Lowfat Plain', 'Nonfat Plain Greek', 'Nonfat Plain'] },
          { brand: 'Weis', products: ['Whole Fat Plain Greek', 'Whole Plain Probiotic', 'Greek Nonfat Plain', 'Nonfat Vanilla Greek'] },
          { brand: 'Wholesome Pantry', products: ['Whole Fat Plain', 'Whole Vanilla', 'Lowfat Plain'] },
          { brand: 'Yoplait', products: ['Nonfat Plain'] },
        ],
      },
      {
        id: 'tofu',
        name: 'Tofu',
        approved: [
          '8, 10, 14, and 16 oz packages',
        ],
        doNotBuy: [],
        shoppingTips: [
          'Combine tofu packages to add up to the number of pounds (lbs) listed on your WIC Shopping List',
        ],
        approvedBrands: [
          { brand: 'Azumaya', products: ['Extra Firm', 'Firm', 'Silken'] },
          { brand: 'Franklin Farms', products: ['Extra Firm', 'Firm', 'Medium Firm', 'Organic Extra Firm', 'Organic Firm', 'Soft'] },
          { brand: 'Good and Gather', products: ['Organic Extra Firm'] },
          { brand: 'House Foods', products: ['Organic Firm', 'Organic Medium Firm', 'Organic Soft', 'Premium Extra Firm', 'Premium Firm', 'Premium Soft'] },
          { brand: 'Nasoya', products: ['Organic Cubed Super Firm', 'Organic Extra Firm', 'Organic Firm', 'Organic Silken', 'Organic Super Firm', 'Soft'] },
          { brand: 'Nature\'s Promise', products: ['Organic Extra Firm', 'Organic Firm'] },
          { brand: 'O Organics', products: ['Extra Firm', 'Firm', 'Silken', 'Super Firm Sprouted'] },
          { brand: 'San Sui', products: ['Extra Firm', 'Firm'] },
          { brand: 'Soy Boy', products: ['Organic Firm'] },
          { brand: 'Wegmans', products: ['Organic Firm', 'Organic Extra Firm', 'Organic Super Firm'] },
          { brand: 'Woodstock', products: ['Organic Extra Firm', 'Organic Firm'] },
        ],
      },
    ],
  },
  {
    id: 'proteins',
    name: 'Proteins',
    icon: 'Egg',
    subCategories: [
      {
        id: 'peanut-butter',
        name: 'Peanut Butter',
        approved: [
          'Any brand',
          '16-18 oz containers',
          'Creamy, crunchy, chunky, smooth',
          'Natural',
          'Reduced Fat',
        ],
        doNotBuy: [
          'Peanut spread',
          'Freshly ground or whipped',
          'Flavored peanut butter',
          'Organic peanut butter',
          'Palm oil or added ingredients such as vitamins, minerals, Omega 3, DHA or EPA',
        ],
        shoppingTips: [],
        approvedBrands: [],
      },
      {
        id: 'canned-beans',
        name: 'Canned Beans',
        approved: [
          'Any brand',
          '15-16 oz cans',
          'Mature beans, peas, lentils, plain refried beans, pigeon peas and lima beans',
        ],
        doNotBuy: [
          'Baked beans',
          'Pork and beans',
          'Added sugars, fats, lard, meat or oils',
        ],
        shoppingTips: [],
        approvedBrands: [],
      },
      {
        id: 'dried-beans',
        name: 'Dried Beans',
        approved: [
          'Any brand',
          '1 pound (lb.) bag',
          'Mature beans, peas, and lentils, refried beans, pigeon peas and lima beans',
        ],
        doNotBuy: [
          'Added sugars, fats, lard, meat or oils',
        ],
        shoppingTips: [
          'Beans/peas/lentils/peanut butter on your Shopping List means you can buy either canned or dried beans, or peanut butter',
        ],
        approvedBrands: [],
      },
      {
        id: 'canned-fish',
        name: 'Canned Fish',
        approved: [
          'Any brand',
          'Fish with salt or vegetable broth',
          'Fish packed in water or oil',
          'Fish with bones and skin',
          'Light tuna (5 and 6 ounce cans)',
          'Pink salmon (5, 6, and 7.5 ounce cans)',
          'Sardines (3.75 ounce cans)',
        ],
        doNotBuy: [
          'Albacore tuna',
          'Blueback salmon',
          'Red salmon',
          'Added flavorings',
          'Added ingredients',
        ],
        shoppingTips: [],
        approvedBrands: [],
      },
      {
        id: 'eggs',
        name: 'Eggs',
        approved: [
          'Any brand',
          '1 dozen (12 count) containers only',
          'Medium or Large',
          'White or brown',
        ],
        doNotBuy: [
          'Jumbo and extra-large',
          'Organic',
          'High cost specialty eggs (reduced cholesterol, cage free/free range, Omega-3 vegetarian fed)',
        ],
        shoppingTips: [],
        approvedBrands: [],
      },
    ],
  },
  {
    id: 'baby-food',
    name: 'Baby Food',
    icon: 'Baby',
    subCategories: [
      {
        id: 'baby-fruits-vegetables',
        name: 'Fruits & Vegetables',
        approved: [
          '4 oz containers = 1 container',
          '2 oz 2 packs (4 oz total) = 1 container',
          '4 oz 2 packs (8 oz total) = 2 containers',
          'Organic',
          'Any fruit or vegetable',
          'Any combination of fruits and vegetables',
        ],
        doNotBuy: [
          'Pouches',
          'Mixtures including non-fruit or non-vegetable ingredients such as meat, yogurt, rice, and noodles',
        ],
        shoppingTips: [],
        approvedBrands: [
          { brand: 'Balebusta Kosher', products: ['Fruits and Vegetables'] },
          { brand: 'Beech Nut', products: ['Fruits and Vegetables'] },
          { brand: 'Bowl & Basket', products: ['Fruits and Vegetables'] },
          { brand: 'First Choice', products: ['Fruits and Vegetables'] },
          { brand: 'Gerber', products: ['Fruits and Vegetables'] },
          { brand: 'Good and Gather', products: ['Fruits and Vegetables'] },
          { brand: 'Happy Baby', products: ['Fruits and Vegetables'] },
          { brand: 'Nature\'s Promise', products: ['Fruits and Vegetables'] },
          { brand: 'O Organics', products: ['Fruits and Vegetables'] },
          { brand: 'Once Upon a Farm', products: ['Fruits and Vegetables'] },
          { brand: 'Parent\'s Choice', products: ['Fruits and Vegetables'] },
          { brand: 'Tippy Toes', products: ['Fruits and Vegetables'] },
          { brand: 'Wholesome Pantry', products: ['Fruits and Vegetables'] },
          { brand: 'Wild Harvest', products: ['Fruits and Vegetables'] },
          { brand: 'Yummy Organics', products: ['Fruits and Vegetables'] },
        ],
      },
      {
        id: 'baby-meats',
        name: 'Meats',
        approved: [
          '2.5 ounce containers',
          'Organic',
          'Any meat with broth or gravy',
        ],
        doNotBuy: [],
        shoppingTips: [
          'Check your WIC Shopping List to see if you are eligible for infant meats',
        ],
        approvedBrands: [
          { brand: 'Beech Nut', products: ['Infant Meats'] },
          { brand: 'Earth\'s Best Organics', products: ['Infant Meats'] },
          { brand: 'First Choice', products: ['Infant Meats'] },
          { brand: 'Gerber', products: ['Infant Meats'] },
        ],
      },
      {
        id: 'infant-cereal',
        name: 'Infant Cereal',
        approved: [
          'Gerber: Cereal for Baby',
          '8 oz or 16 oz containers',
          'Plain varieties only: Oatmeal, rice, or multigrain',
        ],
        doNotBuy: [
          'Organic',
          'Extra ingredients such as DHA, fruit, formula, or added protein',
        ],
        shoppingTips: [],
        approvedBrands: [
          { brand: 'Gerber', products: ['Oatmeal', 'Rice', 'Multigrain'] },
        ],
      },
    ],
  },
  {
    id: 'cereal',
    name: 'Cereal',
    icon: 'Wheat',
    subCategories: [
      {
        id: 'breakfast-cereal',
        name: 'Breakfast Cereal',
        approved: [
          '12 oz box or larger',
          'National/Specialty Brands and Store Brands',
        ],
        doNotBuy: [
          'Organic',
          'Single serve packets',
        ],
        shoppingTips: [],
        approvedBrands: [
          { brand: 'General Mills', products: ['Cheerios (Multi Grain, Oat Crunch)', 'Chex (Blueberry, Cinnamon, Corn, Rice, Vanilla, Wheat)', 'Fiber One', 'Kix', 'Total Whole Grain', 'Wheaties'] },
          { brand: 'Kellogg\'s', products: ['All Bran', 'Corn Flakes', 'Crispix', 'Frosted Mini Wheats', 'Rice Krispies', 'Special K'] },
          { brand: 'Post', products: ['Grape Nuts', 'Great Grains', 'Honey Bunches of Oats'] },
          { brand: 'Quaker', products: ['Life Cereal', 'Oatmeal Squares'] },
          { brand: 'Kashi', products: ['Organic Cocoa Clusters', 'Organic Blueberry Clusters', 'Organic Honey Toasted'] },
          { brand: 'Malt O Meal', products: ['Frosted Mini Spooners', 'Crispy Rice'] },
        ],
      },
      {
        id: 'hot-cereal',
        name: 'Hot Cereal',
        approved: [
          '9.8 oz box or larger',
        ],
        doNotBuy: [],
        shoppingTips: [],
        approvedBrands: [
          { brand: 'Cream of Wheat', products: ['1 Minute Cereal', '2.5 Minute Cereal', 'Instant Packs', 'Whole Grain'] },
          { brand: 'Cream of Rice', products: ['Hot Cereal', 'Instant Packs'] },
          { brand: 'Quaker', products: ['Original Instant Oatmeal', 'Instant Oats with Iron', 'Original Instant Grits'] },
          { brand: 'Maypo', products: ['Instant Maple Oatmeal'] },
          { brand: 'Malt O Meal', products: ['Farina Original Hot Wheat Cereal'] },
        ],
      },
    ],
  },
  {
    id: 'whole-grains',
    name: 'Whole Grains',
    icon: 'Salad',
    subCategories: [
      {
        id: 'brown-rice',
        name: 'Brown Rice',
        approved: [
          'Any brand',
          '14-16 oz or 28-32 oz packages',
          'Plain brown rice in boxes or bags',
          'Instant, quick, or regular cooking',
        ],
        doNotBuy: [
          'Added sugars, fats, oils, or salt',
        ],
        shoppingTips: [
          '16 ounces (oz) = 1 pound (lb) and 32 ounces (oz) = 2 pounds (lb)',
        ],
        approvedBrands: [],
      },
      {
        id: 'tortillas',
        name: 'Tortillas',
        approved: [
          '16 ounce (1 pound) packages',
          '100% Whole Wheat and Corn',
        ],
        doNotBuy: [],
        shoppingTips: [],
        approvedBrands: [
          { brand: 'Best Choice', products: ['Corn Tortillas', '100% Whole Wheat Tortillas'] },
          { brand: 'Bowl & Basket', products: ['Whole Wheat Tortillas'] },
          { brand: 'Celia\'s', products: ['Whole Wheat Tortillas', 'White Corn Tortillas', 'Yellow Corn Tortillas'] },
          { brand: 'Chi Chi\'s', products: ['Whole Wheat Fajita Style Tortillas', 'White Corn Tortillas'] },
          { brand: 'Don Pancho', products: ['White Corn Tortillas', 'Whole Wheat Tortillas'] },
          { brand: 'Great Value', products: ['100% Whole Wheat Tortillas', 'Whole Wheat Tortillas'] },
          { brand: 'Guerrero', products: ['White Corn Tortillas'] },
          { brand: 'Hannaford', products: ['White Corn Taco Sized Tortillas', 'Yellow Corn Taco Sized Tortillas', 'Whole Wheat Fajita Style Tortillas'] },
          { brand: 'La Banderita', products: ['Corn Tortillas', 'Whole Wheat Fajita Tortillas', 'Whole Wheat Soft Taco Tortillas'] },
          { brand: 'Mission', products: ['Soft Corn Extra Thin Tortilla', '100% Whole Wheat Flour Tortillas', 'Restaurant Style Whole Wheat Tortillas'] },
          { brand: 'Nature\'s Promise', products: ['All Natural Corn Tortillas'] },
          { brand: 'PICs', products: ['Corn Taco Tortillas', 'Whole Wheat Fajita Tortillas', 'Whole Wheat Taco Tortillas'] },
          { brand: 'Shop Rite', products: ['Whole Wheat Tortillas'] },
          { brand: 'Stop & Shop', products: ['White Corn Tortillas', 'Yellow Corn Tortillas', 'Whole Wheat Flour Tortillas'] },
          { brand: 'Tops', products: ['Whole Wheat Sandwich Wraps', 'Whole Wheat Tortillas'] },
          { brand: 'Wegmans', products: ['Whole Wheat Sandwich Wraps'] },
          { brand: 'Weis', products: ['Whole Wheat Tortillas'] },
        ],
      },
      {
        id: 'whole-wheat-pasta',
        name: 'Whole Wheat Pasta',
        approved: [
          '16 ounce (1 pound) packages',
          'Any pasta shape (Angel hair, penne, farfalle, etc.)',
        ],
        doNotBuy: [],
        shoppingTips: [],
        approvedBrands: [
          { brand: 'Barilla', products: ['Whole Grain Angel Hair', 'Whole Grain Elbow', 'Whole Grain Linguine', 'Whole Grain Penne', 'Whole Grain Rotini', 'Whole Grain Spaghetti'] },
          { brand: 'Bionaturae', products: ['Organic Whole Wheat Spaghetti', 'Organic Whole Wheat Penne Rigate', 'Organic Whole Wheat Fusilli'] },
          { brand: 'Colavita', products: ['Whole Wheat Capellini', 'Whole Wheat Fusilli', 'Whole Wheat Penne Rigate', 'Whole Wheat Spaghetti'] },
          { brand: 'Delallo', products: ['Organic Whole Wheat Capellini', 'Organic Whole Wheat Penne Rigate', 'Organic Whole Wheat Spaghetti'] },
          { brand: 'Essential Everyday', products: ['Whole Wheat Macaroni', 'Whole Wheat Penne', 'Whole Wheat Rotini', 'Whole Wheat Spaghetti'] },
          { brand: 'Great Value', products: ['Whole Wheat Elbow', 'Whole Wheat Linguine', 'Whole Wheat Penne', 'Whole Wheat Rotini', 'Whole Wheat Spaghetti'] },
          { brand: 'Hannaford', products: ['Whole Wheat Elbow Macaroni', 'Whole Wheat Penne Rigate', 'Whole Wheat Spaghetti'] },
          { brand: 'Nature\'s Promise', products: ['Organic Whole Wheat Penne', 'Organic Whole Wheat Spaghetti', 'Whole Wheat Rigatoni'] },
          { brand: 'O Organics', products: ['100% Whole Wheat Rotini', '100% Whole Wheat Spaghetti', 'Whole Wheat Elbow Macaroni', 'Whole Wheat Penne Rigate'] },
          { brand: 'Ronzoni', products: ['Healthy Harvest Rotini', 'Healthy Harvest Spaghetti', 'Whole Grain Penne Rigate'] },
          { brand: 'ShopRite', products: ['Whole Wheat Penne Rigate', 'Whole Wheat Rotini', 'Whole Wheat Spaghetti'] },
          { brand: 'Signature Select', products: ['Whole Wheat Elbow Macaroni', 'Whole Wheat Penne Rigate', 'Whole Wheat Rotini', 'Whole Wheat Spaghetti'] },
          { brand: 'Wegmans', products: ['Organic Whole Wheat Farfalle', 'Organic Whole Wheat Fusilli', 'Organic Whole Wheat Penne Rigate', 'Organic Whole Wheat Spaghetti'] },
          { brand: 'Weis', products: ['Quality Whole Wheat Penne Rigate', 'Quality Whole Wheat Rotini', 'Quality Whole Wheat Spaghetti'] },
        ],
      },
      {
        id: 'whole-grain-bread',
        name: 'Whole Grain Bread',
        approved: [
          '16 ounce (1 pound) packages',
        ],
        doNotBuy: [],
        shoppingTips: [],
        approvedBrands: [
          { brand: 'Arnold', products: ['100% Whole Wheat Buns', 'Stoneground 100% Whole Wheat Bread'] },
          { brand: 'Bimbo', products: ['100% Whole Wheat Bread'] },
          { brand: 'Bowl & Basket', products: ['100% Whole Wheat Bread'] },
          { brand: 'Foodtown', products: ['100% Whole Wheat Bread'] },
          { brand: 'Gold Medal', products: ['100% Whole Wheat Bread', '100% Whole Wheat Bread with Flax'] },
          { brand: 'Hannaford', products: ['100% Whole Wheat Bread'] },
          { brand: 'Nature\'s Own', products: ['100% Whole Wheat with Honey Bread', 'Whole Grain Sugar Free Bread'] },
          { brand: 'Sara Lee', products: ['100% Whole Wheat Bread'] },
          { brand: 'Shop Rite', products: ['100% Whole Wheat Bread'] },
          { brand: 'Stop & Shop', products: ['100% Whole Wheat Bread', 'No Salt Added Whole Wheat Bread'] },
          { brand: 'Tops', products: ['100% Whole Wheat Bread'] },
          { brand: 'Wegmans', products: ['100% Whole Wheat Bread'] },
          { brand: 'Weis', products: ['100% Whole Wheat Bread'] },
          { brand: 'Wonder', products: ['100% Whole Wheat Bread'] },
        ],
      },
    ],
  },
  {
    id: 'fruits-vegetables',
    name: 'Fruits & Vegetables',
    icon: 'Apple',
    subCategories: [
      {
        id: 'fresh-fruits-vegetables',
        name: 'Fresh Fruits & Vegetables',
        approved: [
          'Any variety of fresh vegetables and fruits',
          'Whole or cut up',
          'Bagged salad mixtures',
          'Bagged vegetables',
        ],
        doNotBuy: [
          'Party trays with dip',
          'Items from the salad bar',
          'Fruit baskets',
          'Decorative vegetables or fruits',
          'Dried produce',
          'Nuts (including peanuts, fruit/nut mixtures)',
          'Herbs, spices, or salad dressings',
        ],
        shoppingTips: [],
        approvedBrands: [],
      },
      {
        id: 'canned-fruits',
        name: 'Canned Fruits',
        approved: [
          'Any brand packed in water or juice',
          'Any variety of fruit or fruit mixtures',
          'Artificial sweeteners allowed',
          'Any size/container/package type',
          'Fruit must be the first ingredient',
          'Applesauce: "No sugar added"',
        ],
        doNotBuy: [
          'Cranberry sauce',
          'Pie filling',
          'Fruit packed in syrup',
          'Added sugars or salt',
          'Added oils/fats',
          'Single serve pouches',
        ],
        shoppingTips: [],
        approvedBrands: [],
      },
      {
        id: 'canned-vegetables',
        name: 'Canned Vegetables',
        approved: [
          'Any brand',
          'May be regular or low sodium/salt',
          'Any variety of vegetable or vegetable mixture',
          'Any size/container/package type',
          'Vegetable must be the first ingredient',
          'Canned tomatoes (paste, puree, whole, crushed, stewed, diced, sauce, salsa)',
        ],
        doNotBuy: [
          'Pickled or creamed',
          'Baked beans/pork and beans',
          'Soups',
          'Ketchup, relishes, olives',
          'Added fats, oils, sugars',
          'Mature beans/peas/lentils',
        ],
        shoppingTips: [],
        approvedBrands: [],
      },
      {
        id: 'frozen-fruits',
        name: 'Frozen Fruits',
        approved: [
          'Any brand',
          'Any size/container/package type',
          'Fruit must be the first ingredient',
          'Any variety of fruit or fruit mixtures',
        ],
        doNotBuy: [
          'Ingredients other than fruit',
          'Added sugar, honey, or syrup',
        ],
        shoppingTips: [],
        approvedBrands: [],
      },
      {
        id: 'frozen-vegetables',
        name: 'Frozen Vegetables',
        approved: [
          'Any brand',
          'Any size/container/package type',
          'With or without salt',
          'Frozen beans, peas, lentils allowed',
          'Any variety of vegetables or vegetable mixtures',
          'Vegetables must be the first ingredient',
        ],
        doNotBuy: [
          'Added sugars, fats, oils',
          'Added sauces or breading',
        ],
        shoppingTips: [],
        approvedBrands: [],
      },
    ],
  },
  {
    id: 'juice',
    name: 'Juice',
    icon: 'GlassWater',
    subCategories: [
      {
        id: 'juice-women',
        name: 'Juice for Women',
        approved: [
          'The size and type listed on your WIC Shopping List',
          '100% juice',
          'Juice with 80% or more vitamin C',
        ],
        doNotBuy: [
          'Organic',
        ],
        shoppingTips: [
          'Shelf stable concentrate: 11.5 oz containers',
          'Frozen concentrate: 11.5-12 oz containers',
        ],
        approvedBrands: [
          { brand: 'Always Save', products: ['Apple', 'Orange'] },
          { brand: 'Best Choice', products: ['Apple', 'Orange', 'Extra Pulp Orange'] },
          { brand: 'Dole', products: ['Orange Peach Mango', 'Pineapple', 'Pineapple Orange Banana'] },
          { brand: 'Essential Everyday', products: ['Apple', 'Grape', 'Orange'] },
          { brand: 'Great Value', products: ['Apple', 'Country Style Orange', 'Grape'] },
          { brand: 'Hannaford', products: ['Apple', 'Grape', 'Orange', 'Pineapple Orange'] },
          { brand: 'Langers', products: ['Apple', 'Grape', 'Orange', 'Pineapple'] },
          { brand: 'Minute Maid', products: ['Calcium Added Orange', 'Country Style Orange', 'Orange'] },
          { brand: 'Old Orchard', products: ['Apple', 'Apple Cranberry', 'Grape', 'Orange'] },
          { brand: 'Shop Rite', products: ['Apple', 'Calcium Added Orange', 'Country Style Orange'] },
          { brand: 'Signature Select', products: ['Apple', 'Grape', 'Orange', 'Pineapple'] },
          { brand: 'Stop & Shop', products: ['Apple', 'Grape', 'Orange'] },
          { brand: 'Tops', products: ['Apple Concentrate', 'Calcium Fortified Orange', 'Orange'] },
          { brand: 'Tropicana', products: ['Homestyle Orange', 'Orange with No Pulp'] },
          { brand: 'Wegmans', products: ['Calcium Fortified Apple', 'Orange', 'Country Style Orange'] },
          { brand: 'Weis', products: ['Apple', 'Orange'] },
          { brand: 'Welch\'s', products: ['100% Tropical Orange', 'Grape', 'White Grape'] },
        ],
      },
      {
        id: 'juice-children',
        name: 'Juice for Children',
        approved: [
          'The size and type listed on your WIC Shopping List',
          '100% juice',
          'Juice with 80% or more vitamin C',
          'Frozen concentrate: 16 oz containers',
          'Fluid: 64 oz containers',
          'Juice boxes: 8 pack (4.23 oz each)',
        ],
        doNotBuy: [
          'Organic',
        ],
        shoppingTips: [
          'Check your WIC Shopping List for juice box eligibility',
        ],
        approvedBrands: [
          { brand: 'Apple & Eve', products: ['Apple', 'Cranberry Blend', 'Fruit Punch'] },
          { brand: 'Best Choice', products: ['Apple', 'Grape', 'Orange', 'Tomato'] },
          { brand: 'Best Yet', products: ['100% Grape', '100% Orange', 'Apple', 'Orange with Calcium'] },
          { brand: 'Bowl & Basket', products: ['Apple', 'Grape', 'Orange', 'Tomato', 'White Grape'] },
          { brand: 'Campbell\'s', products: ['Tomato', 'Low Sodium Tomato'] },
          { brand: 'Essential Everyday', products: ['Apple', 'Grape', 'Orange', 'White Grapefruit', 'Cherry Blend'] },
          { brand: 'Food Club', products: ['Apple', 'Grape', 'Orange', 'Tomato', 'White Grape'] },
          { brand: 'Great Value', products: ['Apple', 'Country Style Orange', 'Grape', 'Orange', 'Tomato', 'Vegetable'] },
          { brand: 'Hannaford', products: ['Apple', 'Grape', 'Orange', 'No Pulp Orange', 'Vegetable'] },
          { brand: 'IGA', products: ['Apple', 'Grape', 'Orange', 'Tomato', 'Vegetable'] },
          { brand: 'Juicy Juice', products: ['Apple', 'Berry', 'Fruit Punch', 'Grape', 'Orange Tangerine'] },
          { brand: 'Langers', products: ['Apple', 'Concord Grape', 'Orange', 'Low Sodium Vegetable'] },
          { brand: 'Mott\'s', products: ['Apple', 'Apple Cherry', 'Fruit Punch', 'Natural Unsweetened Apple'] },
          { brand: 'Ocean Spray', products: ['Apple', 'Cranberry', 'Concord Grape', 'Cranberry Raspberry'] },
          { brand: 'Old Orchard', products: ['Apple', 'Grape', 'Orange Blend'] },
          { brand: 'Our Family', products: ['Apple', 'Grape', 'Orange', 'Vegetable', 'White Grape'] },
          { brand: 'PICs', products: ['Grape', 'Low Sodium Vegetable', 'Orange Peach Mango', 'Tomato', 'White Grape'] },
          { brand: 'Shop Rite', products: ['Apple', 'Grapefruit'] },
          { brand: 'Signature Select', products: ['Apple', 'Grape', 'Orange', 'Tomato', 'Vegetable'] },
          { brand: 'Stop & Shop', products: ['Apple', 'Grape', 'No Pulp Orange', 'Vegetable', 'Tomato'] },
          { brand: 'Tops', products: ['Apple', 'Grape', 'Orange', 'White Grape'] },
          { brand: 'V8', products: ['Vegetable Juice', 'Low Sodium Vegetable Juice', 'Spicy Hot Vegetable Juice'] },
          { brand: 'Wegmans', products: ['Apple', 'Grape', 'No Pulp Orange', 'Pineapple', 'White Grape'] },
          { brand: 'Weis', products: ['Apple', 'Grape', 'Orange', 'Vegetable'] },
          { brand: 'Welch\'s', products: ['Concord Grape', 'White Grape', 'White Grape Peach'] },
        ],
      },
    ],
  },
];

const CATEGORY_MAP: Record<string, string> = {
  'DAIRY/SOY': 'dairy-soy',
  'DAIRY': 'dairy-soy',
  'PROTEINS': 'proteins',
  'PROTEIN': 'proteins',
  'BABY FOOD': 'baby-food',
  'BABY FOOD AND INFANT CEREAL': 'baby-food',
  'INFANT CEREAL': 'baby-food',
  'CEREAL': 'cereal',
  'WHOLE GRAINS': 'whole-grains',
  'WHOLE GRAIN': 'whole-grains',
  'FRUITS & VEGETABLES': 'fruits-vegetables',
  'FRUITS AND VEGETABLES': 'fruits-vegetables',
  'JUICE': 'juice',
};

const SUBCATEGORY_MAP: Record<string, string> = {
  'MILK': 'milk',
  'CHEESE': 'cheese',
  'SOY BEVERAGES': 'soy-beverages',
  'SOY': 'soy-beverages',
  'YOGURT': 'yogurt',
  'TOFU': 'tofu',
  'PEANUT BUTTER': 'peanut-butter',
  'CANNED BEANS': 'canned-beans',
  'MATURE BEANS': 'canned-beans',
  'DRIED BEANS': 'dried-beans',
  'CANNED FISH': 'canned-fish',
  'FISH': 'canned-fish',
  'EGGS': 'eggs',
  'EGG': 'eggs',
  'FRUITS AND VEGETABLES': 'baby-fruits-vegetables',
  'MEATS': 'baby-meats',
  'INFANT MEATS': 'baby-meats',
  'INFANT CEREAL': 'infant-cereal',
  'BREAKFAST CEREAL': 'breakfast-cereal',
  'HOT CEREAL': 'hot-cereal',
  'BROWN RICE': 'brown-rice',
  'RICE': 'brown-rice',
  'TORTILLAS': 'tortillas',
  'WHOLE WHEAT PASTA': 'whole-wheat-pasta',
  'PASTA': 'whole-wheat-pasta',
  'WHOLE GRAIN BREAD': 'whole-grain-bread',
  'BREAD': 'whole-grain-bread',
  'FRESH FRUITS & VEGETABLES': 'fresh-fruits-vegetables',
  'FRESH': 'fresh-fruits-vegetables',
  'CANNED FRUITS': 'canned-fruits',
  'CANNED VEGETABLES': 'canned-vegetables',
  'FROZEN FRUITS': 'frozen-fruits',
  'FROZEN VEGETABLES': 'frozen-vegetables',
  'JUICE FOR WOMEN': 'juice-women',
  'JUICE FOR CHILDREN': 'juice-children',
};

export function getGuideInfoForProduct(
  categoryDescription: string,
  subCategoryDescription: string
): WicFoodSubCategory | null {
  const normalizedCategory = categoryDescription?.trim().toUpperCase() || '';
  const normalizedSubCategory = subCategoryDescription?.trim().toUpperCase() || '';

  const categoryId = CATEGORY_MAP[normalizedCategory];
  if (!categoryId) return null;

  const subCategoryId = SUBCATEGORY_MAP[normalizedSubCategory];
  if (!subCategoryId) return null;

  const category = WIC_FOODS_GUIDE.find(c => c.id === categoryId);
  if (!category) return null;

  const subCategory = category.subCategories.find(sc => sc.id === subCategoryId);
  return subCategory || null;
}

export function getCategoryById(id: string): WicFoodCategory | undefined {
  return WIC_FOODS_GUIDE.find(c => c.id === id);
}

export function getSubCategoryById(categoryId: string, subCategoryId: string): WicFoodSubCategory | undefined {
  const category = getCategoryById(categoryId);
  return category?.subCategories.find(sc => sc.id === subCategoryId);
}
