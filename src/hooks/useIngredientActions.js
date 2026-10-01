import { supabase } from '../lib/supabase';
import { playBeepSound } from '../utils/sound';

export function useIngredientActions(master, showToast) {
  const syncVariantStockFromRecipes = async (variantId) => {
    if (!variantId) return;

    const { data: recipes } = await supabase
      .from('product_recipes')
      .select('ingredient_id, quantity_required')
      .eq('variant_id', variantId);

    if (!recipes || recipes.length === 0) return;

    const ingIds = recipes.map((r) => r.ingredient_id);
    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('id, current_stock')
      .in('id', ingIds);

    if (!ingredients || ingredients.length === 0) return;

    const capacities = recipes.map((r) => {
      const ing = ingredients.find((i) => String(i.id) === String(r.ingredient_id));
      if (!ing) return 0;
      const currentStock = parseFloat(ing.current_stock || 0);
      const qtyReq = parseFloat(r.quantity_required || 0);
      return qtyReq > 0 ? Math.floor(currentStock / qtyReq) : 0;
    });

    const newStock = Math.min(...capacities);

    await supabase
      .from('inventories')
      .update({ stock: newStock })
      .eq('variant_id', variantId)
      .eq('store_id', master.CURRENT_STORE_ID);
  };

  const syncAllVariantsUsingIngredient = async (ingredientId) => {
    if (!ingredientId) return;

    const { data: recipes } = await supabase
      .from('product_recipes')
      .select('variant_id')
      .eq('ingredient_id', ingredientId);

    if (!recipes || recipes.length === 0) return;

    const variantIds = [...new Set(recipes.map((r) => r.variant_id))];
    for (const vId of variantIds) {
      await syncVariantStockFromRecipes(vId);
    }
  };

  const handleSaveIngredient = async (ingData) => {
    try {
      const payload = {
        store_id: master.CURRENT_STORE_ID,
        name: ingData.name,
        unit: ingData.unit || 'Gram',
        current_stock: parseFloat(ingData.current_stock) || 0,
        min_stock: parseFloat(ingData.min_stock) || 0,
        cost_per_unit: parseFloat(ingData.cost_per_unit) || 0,
      };

      let targetIngId = ingData.id;

      if (ingData.id) {
        const { data: updatedIng, error } = await supabase
          .from('ingredients')
          .update(payload)
          .eq('id', ingData.id)
          .select()
          .single();

        if (error) throw error;

        if (master.setIngredientsList) {
          master.setIngredientsList((prev) =>
            (Array.isArray(prev) ? prev : []).map((item) =>
              String(item.id) === String(ingData.id)
                ? updatedIng || { ...item, ...payload }
                : item
            )
          );
        }
        showToast('Bahan baku berhasil diperbarui!', 'success');
      } else {
        const { data: newIng, error } = await supabase
          .from('ingredients')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        if (newIng) targetIngId = newIng.id;

        if (master.setIngredientsList && newIng) {
          master.setIngredientsList((prev) => [
            ...(Array.isArray(prev) ? prev : []),
            newIng,
          ]);
        }
        showToast('Bahan baku berhasil disimpan!', 'success');
      }

      if (targetIngId) {
        await syncAllVariantsUsingIngredient(targetIngId);
      }

      if (master.fetchInitialData) await master.fetchInitialData();
      playBeepSound();
    } catch (err) {
      showToast('Gagal menyimpan bahan baku: ' + err.message, 'error');
    }
  };

  const handleDeleteIngredient = async (id) => {
    if (!id) return showToast('ID bahan baku tidak valid!', 'warning');

    try {
      if (master.setIngredientsList) {
        master.setIngredientsList((prev) =>
          (Array.isArray(prev) ? prev : []).filter((item) => String(item.id) !== String(id))
        );
      }

      await supabase.from('product_recipes').delete().eq('ingredient_id', id);
      const { error } = await supabase.from('ingredients').delete().eq('id', id);

      if (error) throw error;

      if (master.fetchInitialData) await master.fetchInitialData();
      playBeepSound();
      showToast('Bahan baku berhasil dihapus!', 'success');
    } catch (err) {
      showToast('Gagal menghapus bahan baku: ' + err.message, 'error');
    }
  };

  const handleSaveRecipe = async (recipeData) => {
    try {
      const existing = (master.productRecipes || []).find(
        (r) =>
          String(r.variant_id) === String(recipeData.variant_id) &&
          String(r.ingredient_id) === String(recipeData.ingredient_id)
      );

      if (existing) {
        const { error } = await supabase
          .from('product_recipes')
          .update({ quantity_required: recipeData.quantity_required })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('product_recipes')
          .insert([
            {
              variant_id: recipeData.variant_id,
              ingredient_id: recipeData.ingredient_id,
              quantity_required: recipeData.quantity_required,
            },
          ]);
        if (error) throw error;
      }

      await syncVariantStockFromRecipes(recipeData.variant_id);

      if (master.fetchInitialData) await master.fetchInitialData();
      playBeepSound();
      showToast('Resep berhasil disimpan!', 'success');
    } catch (err) {
      showToast('Gagal menyimpan resep: ' + err.message, 'error');
    }
  };

  const handleDeleteRecipeItem = async (id) => {
    try {
      const { data: targetRecipe } = await supabase
        .from('product_recipes')
        .select('variant_id')
        .eq('id', id)
        .single();

      const { error } = await supabase.from('product_recipes').delete().eq('id', id);
      if (error) throw error;

      if (targetRecipe?.variant_id) {
        await syncVariantStockFromRecipes(targetRecipe.variant_id);
      }

      if (master.fetchInitialData) await master.fetchInitialData();
      playBeepSound();
      showToast('Bahan resep berhasil dihapus!', 'info');
    } catch (err) {
      showToast('Gagal menghapus bahan resep: ' + err.message, 'error');
    }
  };

  return {
    handleSaveIngredient,
    handleDeleteIngredient,
    handleSaveRecipe,
    handleDeleteRecipeItem
  };
}