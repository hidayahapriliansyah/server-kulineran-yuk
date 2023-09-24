-- CreateEnum
CREATE TYPE "RestaurantCustomerPayment" AS ENUM ('AFTER_ORDER', 'BEFORE_ORDER');

-- CreateEnum
CREATE TYPE "CustomerJoinBotramSetting" AS ENUM ('DIRECTLY', 'INVITATION', 'BYSELF');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('READY_TO_ORDER', 'ACCEPTED', 'PROCESSED', 'DONE', 'CANCEL');

-- CreateEnum
CREATE TYPE "BotramGroupStatus" AS ENUM ('ORDERING', 'ALL_READY_ORDER', 'DONE');

-- CreateEnum
CREATE TYPE "BotramGroupMemberStatus" AS ENUM ('NOT_JOIN_YET', 'ORDERING', 'ORDER_READY', 'EXIT', 'EXPELLED');

-- CreateEnum
CREATE TYPE "BotramGroupOrderStatus" AS ENUM ('READY_TO_ORDER', 'ACCEPTED', 'PROCESSED', 'DONE', 'CANCEL');

-- CreateTable
CREATE TABLE "Province" (
    "id" UUID NOT NULL,
    "codeId" VARCHAR(12) NOT NULL,
    "province" VARCHAR(50) NOT NULL,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Regency" (
    "id" UUID NOT NULL,
    "codeId" VARCHAR(12) NOT NULL,
    "provinceId" VARCHAR(12) NOT NULL,
    "regency" VARCHAR(50) NOT NULL,

    CONSTRAINT "Regency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" UUID NOT NULL,
    "codeId" VARCHAR(12) NOT NULL,
    "regencyId" VARCHAR(12) NOT NULL,
    "district" VARCHAR(50) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Village" (
    "id" UUID NOT NULL,
    "codeId" VARCHAR(12) NOT NULL,
    "districtId" VARCHAR(12) NOT NULL,
    "village" VARCHAR(50) NOT NULL,

    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "username" VARCHAR(30) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "passMinimumProfileSetting" BOOLEAN NOT NULL DEFAULT false,
    "avatar" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "customerPayment" "RestaurantCustomerPayment" NOT NULL DEFAULT 'AFTER_ORDER',
    "locationLink" TEXT,
    "contact" VARCHAR(14),
    "image1" TEXT,
    "image2" TEXT,
    "image3" TEXT,
    "image4" TEXT,
    "image5" TEXT,
    "openingHour" VARCHAR(5),
    "closingHour" VARCHAR(5),
    "dayOff" TEXT,
    "fasilities" TEXT,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantResetPasswordRequest" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "restaurantId" UUID NOT NULL,
    "uniqueString" TEXT NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantResetPasswordRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantVerification" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "restaurantId" UUID NOT NULL,
    "uniqueString" TEXT NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantAddress" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "restaurantId" UUID NOT NULL,
    "villageId" VARCHAR(12) NOT NULL,
    "villageName" VARCHAR(50) NOT NULL,
    "districtName" VARCHAR(50) NOT NULL,
    "regencyName" VARCHAR(50) NOT NULL,
    "provinceName" VARCHAR(50) NOT NULL,
    "detail" VARCHAR(200),

    CONSTRAINT "RestaurantAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Etalase" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "restaurantId" UUID NOT NULL,

    CONSTRAINT "Etalase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "restaurantId" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "isBungkusAble" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "image1" TEXT NOT NULL,
    "image2" TEXT,
    "image3" TEXT,
    "image4" TEXT,
    "image5" TEXT,
    "etalaseId" UUID NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuSpicyLevel" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "menuId" UUID NOT NULL,

    CONSTRAINT "MenuSpicyLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomMenuCategory" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "restaurantId" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "isBungkusAble" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CustomMenuCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomMenuCategorySpicyLevel" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customMenuCategoryId" UUID NOT NULL,
    "maxSpicy" INTEGER NOT NULL,

    CONSTRAINT "CustomMenuCategorySpicyLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomMenuComposition" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "restaurantId" UUID NOT NULL,
    "customMenuCategoryId" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL,
    "image1" TEXT NOT NULL,
    "image2" TEXT,

    CONSTRAINT "CustomMenuComposition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "username" VARCHAR(30) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "joinBotram" "CustomerJoinBotramSetting" NOT NULL DEFAULT 'INVITATION',

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerResetPasswordRequest" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uniqueString" TEXT NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "customerId" UUID NOT NULL,

    CONSTRAINT "CustomerResetPasswordRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerVerification" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uniqueString" TEXT NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "customerId" UUID NOT NULL,

    CONSTRAINT "CustomerVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" UUID NOT NULL,
    "menuId" UUID NOT NULL,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantReview" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "hasCustomerBeenShoppingHere" BOOLEAN NOT NULL DEFAULT false,
    "reviewDescription" VARCHAR(250) NOT NULL,
    "rating" SMALLINT NOT NULL,
    "isReplied" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RestaurantReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantReviewResponse" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "restaurantReviewId" UUID NOT NULL,
    "responseDescription" VARCHAR(250) NOT NULL,

    CONSTRAINT "RestaurantReviewResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuCart" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" UUID NOT NULL,
    "menuId" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "quantity" SMALLINT NOT NULL,
    "isDibungkus" BOOLEAN NOT NULL DEFAULT false,
    "menuCartSpicyLevelId" UUID,

    CONSTRAINT "MenuCart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuCartSpicyLevel" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "menuCartId" UUID NOT NULL,
    "level" SMALLINT NOT NULL,

    CONSTRAINT "MenuCartSpicyLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomMenu" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" UUID NOT NULL,
    "customMenuCategoryId" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "CustomMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickedCustomMenuComposition" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customMenuId" UUID NOT NULL,
    "customMenuCompositionId" UUID NOT NULL,
    "qty" SMALLINT NOT NULL,

    CONSTRAINT "PickedCustomMenuComposition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomMenuCart" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" UUID NOT NULL,
    "customMenuId" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "quantity" SMALLINT NOT NULL,
    "isDibungkus" BOOLEAN NOT NULL DEFAULT false,
    "customMenuCartSpicyLevelId" UUID,

    CONSTRAINT "CustomMenuCart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomMenuCartSpicyLevel" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customMenuCartId" UUID NOT NULL,
    "level" SMALLINT NOT NULL,

    CONSTRAINT "CustomMenuCartSpicyLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "total" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'READY_TO_ORDER',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "isAcceptedByCustomer" BOOLEAN NOT NULL DEFAULT false,
    "customerNote" VARCHAR(150) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderedMenu" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" UUID NOT NULL,
    "menuId" UUID NOT NULL,
    "menuName" VARCHAR(80) NOT NULL,
    "menuPrice" INTEGER NOT NULL,
    "quantity" SMALLINT NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "isDibungkus" BOOLEAN NOT NULL,
    "orderedMenuSpicyLevelId" UUID,

    CONSTRAINT "OrderedMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderedMenuSpicyLevel" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderedMenuId" UUID NOT NULL,
    "level" SMALLINT NOT NULL,

    CONSTRAINT "OrderedMenuSpicyLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderedCustomMenu" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" UUID NOT NULL,
    "customMenuId" UUID NOT NULL,
    "customMenuName" VARCHAR(80) NOT NULL,
    "customMenuPrice" INTEGER NOT NULL,
    "quantity" SMALLINT NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "isDibungkus" BOOLEAN NOT NULL,
    "orderedCustomMenuSpicyLevelId" UUID,

    CONSTRAINT "OrderedCustomMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderedCustomMenuSpicyLevel" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderedCustomMenuId" UUID NOT NULL,
    "level" SMALLINT NOT NULL,

    CONSTRAINT "OrderedCustomMenuSpicyLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotramGroup" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorCustomerId" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "openMembership" BOOLEAN NOT NULL DEFAULT true,
    "status" "BotramGroupStatus" NOT NULL DEFAULT 'ORDERING',

    CONSTRAINT "BotramGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotramGroupMember" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "botramGroupId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "status" "BotramGroupMemberStatus" NOT NULL,

    CONSTRAINT "BotramGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotramGroupOrder" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "botramGroupId" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" "BotramGroupOrderStatus" NOT NULL DEFAULT 'READY_TO_ORDER',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BotramGroupOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotramGroupMemberOrder" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "botramGroupMemberId" UUID NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "BotramGroupMemberOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotramGroupMenuCart" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "botramGroupId" UUID NOT NULL,
    "botramGroupMemberId" UUID NOT NULL,
    "menuId" UUID NOT NULL,
    "quantity" SMALLINT NOT NULL,
    "isDibungkus" BOOLEAN NOT NULL DEFAULT false,
    "botramMenuCartSpicyLevelId" TEXT,

    CONSTRAINT "BotramGroupMenuCart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotramMenuCartSpicyLevel" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "botramGroupMenuCartId" UUID NOT NULL,
    "level" SMALLINT NOT NULL,

    CONSTRAINT "BotramMenuCartSpicyLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotramGroupCustomMenuCart" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "botramGroupId" UUID NOT NULL,
    "botramGroupMemberId" UUID NOT NULL,
    "customMenuId" UUID NOT NULL,
    "quantity" SMALLINT NOT NULL,
    "isDibungkus" BOOLEAN NOT NULL DEFAULT false,
    "botramCustomMenuCartSpicyLevelId" TEXT,

    CONSTRAINT "BotramGroupCustomMenuCart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotramCustomMenuCartSpicyLevel" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "botramGroupCustomMenuCartId" UUID NOT NULL,
    "level" SMALLINT NOT NULL,

    CONSTRAINT "BotramCustomMenuCartSpicyLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantNotification" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "restaurantId" UUID NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "description" VARCHAR(250) NOT NULL,
    "redirectLink" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RestaurantNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerNotification" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" UUID NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "description" VARCHAR(250) NOT NULL,
    "redirectLink" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CustomerNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Province_codeId_key" ON "Province"("codeId");

-- CreateIndex
CREATE UNIQUE INDEX "Regency_codeId_key" ON "Regency"("codeId");

-- CreateIndex
CREATE UNIQUE INDEX "District_codeId_key" ON "District"("codeId");

-- CreateIndex
CREATE UNIQUE INDEX "Village_codeId_key" ON "Village"("codeId");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_username_key" ON "Restaurant"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_email_key" ON "Restaurant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_password_key" ON "Restaurant"("password");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantAddress_restaurantId_key" ON "RestaurantAddress"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuSpicyLevel_menuId_key" ON "MenuSpicyLevel"("menuId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomMenuCategorySpicyLevel_customMenuCategoryId_key" ON "CustomMenuCategorySpicyLevel"("customMenuCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_username_key" ON "Customer"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantReviewResponse_restaurantReviewId_key" ON "RestaurantReviewResponse"("restaurantReviewId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuCart_menuCartSpicyLevelId_key" ON "MenuCart"("menuCartSpicyLevelId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuCart_customerId_menuId_quantity_isDibungkus_menuCartSpi_key" ON "MenuCart"("customerId", "menuId", "quantity", "isDibungkus", "menuCartSpicyLevelId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuCartSpicyLevel_menuCartId_key" ON "MenuCartSpicyLevel"("menuCartId");

-- CreateIndex
CREATE UNIQUE INDEX "PickedCustomMenuComposition_customMenuId_customMenuComposit_key" ON "PickedCustomMenuComposition"("customMenuId", "customMenuCompositionId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomMenuCart_customMenuCartSpicyLevelId_key" ON "CustomMenuCart"("customMenuCartSpicyLevelId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomMenuCart_customerId_customMenuId_quantity_isDibungkus_key" ON "CustomMenuCart"("customerId", "customMenuId", "quantity", "isDibungkus", "customMenuCartSpicyLevelId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomMenuCartSpicyLevel_customMenuCartId_key" ON "CustomMenuCartSpicyLevel"("customMenuCartId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderedMenu_orderedMenuSpicyLevelId_key" ON "OrderedMenu"("orderedMenuSpicyLevelId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderedMenu_orderId_menuId_quantity_isDibungkus_orderedMenu_key" ON "OrderedMenu"("orderId", "menuId", "quantity", "isDibungkus", "orderedMenuSpicyLevelId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderedMenuSpicyLevel_orderedMenuId_key" ON "OrderedMenuSpicyLevel"("orderedMenuId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderedCustomMenu_orderedCustomMenuSpicyLevelId_key" ON "OrderedCustomMenu"("orderedCustomMenuSpicyLevelId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderedCustomMenuSpicyLevel_orderedCustomMenuId_key" ON "OrderedCustomMenuSpicyLevel"("orderedCustomMenuId");

-- CreateIndex
CREATE UNIQUE INDEX "BotramGroupMemberOrder_botramGroupMemberId_key" ON "BotramGroupMemberOrder"("botramGroupMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "BotramGroupMenuCart_botramGroupId_key" ON "BotramGroupMenuCart"("botramGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "BotramGroupMenuCart_botramGroupMemberId_key" ON "BotramGroupMenuCart"("botramGroupMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "BotramGroupMenuCart_menuId_key" ON "BotramGroupMenuCart"("menuId");

-- CreateIndex
CREATE UNIQUE INDEX "BotramGroupMenuCart_botramGroupMemberId_menuId_quantity_isD_key" ON "BotramGroupMenuCart"("botramGroupMemberId", "menuId", "quantity", "isDibungkus", "botramMenuCartSpicyLevelId");

-- CreateIndex
CREATE UNIQUE INDEX "BotramMenuCartSpicyLevel_botramGroupMenuCartId_key" ON "BotramMenuCartSpicyLevel"("botramGroupMenuCartId");

-- CreateIndex
CREATE UNIQUE INDEX "BotramGroupCustomMenuCart_botramGroupId_key" ON "BotramGroupCustomMenuCart"("botramGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "BotramGroupCustomMenuCart_botramGroupMemberId_key" ON "BotramGroupCustomMenuCart"("botramGroupMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "BotramGroupCustomMenuCart_customMenuId_key" ON "BotramGroupCustomMenuCart"("customMenuId");

-- CreateIndex
CREATE UNIQUE INDEX "BotramGroupCustomMenuCart_botramGroupMemberId_customMenuId__key" ON "BotramGroupCustomMenuCart"("botramGroupMemberId", "customMenuId", "quantity", "isDibungkus", "botramCustomMenuCartSpicyLevelId");

-- CreateIndex
CREATE UNIQUE INDEX "BotramCustomMenuCartSpicyLevel_botramGroupCustomMenuCartId_key" ON "BotramCustomMenuCartSpicyLevel"("botramGroupCustomMenuCartId");

-- AddForeignKey
ALTER TABLE "Regency" ADD CONSTRAINT "Regency_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("codeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_regencyId_fkey" FOREIGN KEY ("regencyId") REFERENCES "Regency"("codeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("codeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantResetPasswordRequest" ADD CONSTRAINT "RestaurantResetPasswordRequest_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantVerification" ADD CONSTRAINT "RestaurantVerification_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantAddress" ADD CONSTRAINT "RestaurantAddress_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantAddress" ADD CONSTRAINT "RestaurantAddress_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("codeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etalase" ADD CONSTRAINT "Etalase_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_etalaseId_fkey" FOREIGN KEY ("etalaseId") REFERENCES "Etalase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuSpicyLevel" ADD CONSTRAINT "MenuSpicyLevel_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomMenuCategory" ADD CONSTRAINT "CustomMenuCategory_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomMenuCategorySpicyLevel" ADD CONSTRAINT "CustomMenuCategorySpicyLevel_customMenuCategoryId_fkey" FOREIGN KEY ("customMenuCategoryId") REFERENCES "CustomMenuCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomMenuComposition" ADD CONSTRAINT "CustomMenuComposition_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomMenuComposition" ADD CONSTRAINT "CustomMenuComposition_customMenuCategoryId_fkey" FOREIGN KEY ("customMenuCategoryId") REFERENCES "CustomMenuCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerResetPasswordRequest" ADD CONSTRAINT "CustomerResetPasswordRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerVerification" ADD CONSTRAINT "CustomerVerification_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantReview" ADD CONSTRAINT "RestaurantReview_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantReview" ADD CONSTRAINT "RestaurantReview_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantReviewResponse" ADD CONSTRAINT "RestaurantReviewResponse_restaurantReviewId_fkey" FOREIGN KEY ("restaurantReviewId") REFERENCES "RestaurantReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuCart" ADD CONSTRAINT "MenuCart_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuCart" ADD CONSTRAINT "MenuCart_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuCart" ADD CONSTRAINT "MenuCart_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuCartSpicyLevel" ADD CONSTRAINT "MenuCartSpicyLevel_menuCartId_fkey" FOREIGN KEY ("menuCartId") REFERENCES "MenuCart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomMenu" ADD CONSTRAINT "CustomMenu_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomMenu" ADD CONSTRAINT "CustomMenu_customMenuCategoryId_fkey" FOREIGN KEY ("customMenuCategoryId") REFERENCES "CustomMenuCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomMenu" ADD CONSTRAINT "CustomMenu_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickedCustomMenuComposition" ADD CONSTRAINT "PickedCustomMenuComposition_customMenuId_fkey" FOREIGN KEY ("customMenuId") REFERENCES "CustomMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickedCustomMenuComposition" ADD CONSTRAINT "PickedCustomMenuComposition_customMenuCompositionId_fkey" FOREIGN KEY ("customMenuCompositionId") REFERENCES "CustomMenuComposition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomMenuCart" ADD CONSTRAINT "CustomMenuCart_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomMenuCart" ADD CONSTRAINT "CustomMenuCart_customMenuId_fkey" FOREIGN KEY ("customMenuId") REFERENCES "CustomMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomMenuCart" ADD CONSTRAINT "CustomMenuCart_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomMenuCartSpicyLevel" ADD CONSTRAINT "CustomMenuCartSpicyLevel_customMenuCartId_fkey" FOREIGN KEY ("customMenuCartId") REFERENCES "CustomMenuCart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedMenu" ADD CONSTRAINT "OrderedMenu_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedMenu" ADD CONSTRAINT "OrderedMenu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedMenuSpicyLevel" ADD CONSTRAINT "OrderedMenuSpicyLevel_orderedMenuId_fkey" FOREIGN KEY ("orderedMenuId") REFERENCES "OrderedMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedCustomMenu" ADD CONSTRAINT "OrderedCustomMenu_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedCustomMenu" ADD CONSTRAINT "OrderedCustomMenu_customMenuId_fkey" FOREIGN KEY ("customMenuId") REFERENCES "CustomMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedCustomMenuSpicyLevel" ADD CONSTRAINT "OrderedCustomMenuSpicyLevel_orderedCustomMenuId_fkey" FOREIGN KEY ("orderedCustomMenuId") REFERENCES "OrderedCustomMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotramGroup" ADD CONSTRAINT "BotramGroup_creatorCustomerId_fkey" FOREIGN KEY ("creatorCustomerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotramGroup" ADD CONSTRAINT "BotramGroup_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotramGroupMember" ADD CONSTRAINT "BotramGroupMember_botramGroupId_fkey" FOREIGN KEY ("botramGroupId") REFERENCES "BotramGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotramGroupMember" ADD CONSTRAINT "BotramGroupMember_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotramGroupOrder" ADD CONSTRAINT "BotramGroupOrder_botramGroupId_fkey" FOREIGN KEY ("botramGroupId") REFERENCES "BotramGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotramGroupOrder" ADD CONSTRAINT "BotramGroupOrder_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotramGroupMemberOrder" ADD CONSTRAINT "BotramGroupMemberOrder_botramGroupMemberId_fkey" FOREIGN KEY ("botramGroupMemberId") REFERENCES "BotramGroupMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotramGroupMenuCart" ADD CONSTRAINT "BotramGroupMenuCart_botramGroupId_fkey" FOREIGN KEY ("botramGroupId") REFERENCES "BotramGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotramGroupMenuCart" ADD CONSTRAINT "BotramGroupMenuCart_botramGroupMemberId_fkey" FOREIGN KEY ("botramGroupMemberId") REFERENCES "BotramGroupMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotramGroupMenuCart" ADD CONSTRAINT "BotramGroupMenuCart_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotramMenuCartSpicyLevel" ADD CONSTRAINT "BotramMenuCartSpicyLevel_botramGroupMenuCartId_fkey" FOREIGN KEY ("botramGroupMenuCartId") REFERENCES "BotramGroupMenuCart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotramGroupCustomMenuCart" ADD CONSTRAINT "BotramGroupCustomMenuCart_botramGroupId_fkey" FOREIGN KEY ("botramGroupId") REFERENCES "BotramGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotramGroupCustomMenuCart" ADD CONSTRAINT "BotramGroupCustomMenuCart_botramGroupMemberId_fkey" FOREIGN KEY ("botramGroupMemberId") REFERENCES "BotramGroupMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotramGroupCustomMenuCart" ADD CONSTRAINT "BotramGroupCustomMenuCart_customMenuId_fkey" FOREIGN KEY ("customMenuId") REFERENCES "CustomMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotramCustomMenuCartSpicyLevel" ADD CONSTRAINT "BotramCustomMenuCartSpicyLevel_botramGroupCustomMenuCartId_fkey" FOREIGN KEY ("botramGroupCustomMenuCartId") REFERENCES "BotramGroupCustomMenuCart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantNotification" ADD CONSTRAINT "RestaurantNotification_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerNotification" ADD CONSTRAINT "CustomerNotification_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
