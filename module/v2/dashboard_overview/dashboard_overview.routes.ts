import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";
import {
  insolesAndShoesRevenue,
  seallingLocationRevenue,
  revenueChartData,
  revenueCompareMonthWithYear,
  revenueCompareMonthWithYearInsoles,
  revenueCompareMonthWithYearShoes,
  revenueOfFinishedInsoles,
  revenueOfFinishedShoes,
  quantityOfInproductionShoes,
  quantityOfInproductionInsoles,
  insoleQuantityPerStatus,
  shoeQuantityPerStatus,
  insurancePaymentComparison
} from "./dashboard_overview.controllers";

const router = express.Router();

router.get(
  "/insoles-and-shoes-revenue",
  verifyUser("PARTNER", "ADMIN"),
  insolesAndShoesRevenue
);
router.get(
  "/sealling-location-revenue",
  verifyUser("PARTNER", "ADMIN"),
  seallingLocationRevenue
);
router.get(
  "/revenue-chart-data",
  verifyUser("PARTNER", "ADMIN"),
  revenueChartData
);

router.get(
  "/revenue-compare-month-with-year",
  verifyUser("PARTNER", "ADMIN"),
  revenueCompareMonthWithYear
);


//----------------------------------------------------
router.get(
  "/revenue-compare-month-with-year-insoles",
  verifyUser("PARTNER", "ADMIN"),
  revenueCompareMonthWithYearInsoles
);

router.get(
    "/quantity-of-finished-insoles",
    verifyUser("PARTNER", "ADMIN"),
    revenueOfFinishedInsoles
  );

router.get(
  "/revenue-of-finished-shoes",
  verifyUser("PARTNER", "ADMIN"),
  revenueOfFinishedShoes
);


//----------------------------------------------------
router.get(
  "/revenue-compare-month-with-year-shoes",
  verifyUser("PARTNER", "ADMIN"),
  revenueCompareMonthWithYearShoes
);

router.get(
  "/quantity-of-inproduction-shoes", 
  verifyUser("PARTNER", "ADMIN"),
  quantityOfInproductionShoes
);

router.get(
  "/quantity-of-inproduction-insoles",
  verifyUser("PARTNER", "ADMIN"),
  quantityOfInproductionInsoles
);
//-------------------------------------------------------------

router.get(
  "/insole-quantity-par-status",
  verifyUser("PARTNER", "ADMIN"),
  insoleQuantityPerStatus
);

router.get(
  "/shoe-quantity-per-status",
  verifyUser("PARTNER", "ADMIN"),
  shoeQuantityPerStatus
);

router.get(
  "/insurance-payment-comparison",
  verifyUser("PARTNER", "ADMIN"),
  insurancePaymentComparison
);

export default router;
