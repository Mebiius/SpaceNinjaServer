import { RequestHandler } from "express";
import { ISellRequest } from "@/src/types/sellTypes";
import { getAccountIdForRequest } from "@/src/services/loginService";
import { getInventory, addMods } from "@/src/services/inventoryService";

export const sellController: RequestHandler = async (req, res) => {
    const payload: ISellRequest = JSON.parse(req.body.toString());
    const accountId = await getAccountIdForRequest(req);
    const inventory = await getInventory(accountId);

    // Give currency
    if (payload.SellCurrency == "SC_RegularCredits") {
        inventory.RegularCredits += payload.SellPrice;
    } else if (payload.SellCurrency == "SC_FusionPoints") {
        inventory.FusionPoints += payload.SellPrice;
    } else {
        throw new Error("Unknown SellCurrency: " + payload.SellCurrency);
    }

    // Remove item(s)
    if (payload.Items.Suits) {
        payload.Items.Suits.forEach(sellItem => {
            inventory.Suits.pull({ _id: sellItem.String });
        });
    }
    if (payload.Items.LongGuns) {
        payload.Items.LongGuns.forEach(sellItem => {
            inventory.LongGuns.pull({ _id: sellItem.String });
        });
    }
    if (payload.Items.Pistols) {
        payload.Items.Pistols.forEach(sellItem => {
            inventory.Pistols.pull({ _id: sellItem.String });
        });
    }
    if (payload.Items.Melee) {
        payload.Items.Melee.forEach(sellItem => {
            inventory.Melee.pull({ _id: sellItem.String });
        });
    }
    if (payload.Items.Recipes) {
        // TODO
        // Note: sellItem.String is a uniqueName in this case
    }
    if (payload.Items.Upgrades) {
        payload.Items.Upgrades.forEach(sellItem => {
            if (sellItem.Count == 0) {
                inventory.Upgrades.pull({ _id: sellItem.String });
            } else {
                addMods(inventory, [
                    {
                        ItemType: sellItem.String,
                        ItemCount: sellItem.Count * -1
                    }
                ]);
            }
        });
    }

    await inventory.save();
    res.json({});
};
