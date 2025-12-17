module freak_marketplace::freak_marketplace {
    use std::string::{Self, String};
    use sui::coin::{Coin};
    use sui::sui::SUI;
    use sui::dynamic_object_field as dof;
    use sui::package;
    use sui::display;

    /// ONE TIME WITNESS
    /// This is required to set up the Display (Image/Name) standard.
    /// It must be named exactly the same as the module, but uppercase.
    public struct FREAK_MARKETPLACE has drop {}

    /// The NFT Struct (The "Freak")
    public struct Freak has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: String,
        // We store attributes here so we can read them later
        attribute_keys: vector<String>,
        attribute_values: vector<String>,
    }

    /// The generic Listing struct to hold the item and price.
    public struct Listing has key, store {
        id: UID,
        seller: address,
        price: u64,
    }

    /// The shared object that tracks all listings.
    public struct Marketplace has key {
        id: UID,
    }

    /// Error codes
    const EInsufficientFunds: u64 = 0;

    /// Initialize: Create Marketplace AND Setup Display
    fun init(otw: FREAK_MARKETPLACE, ctx: &mut TxContext) {
        // 1. Create the Marketplace Shared Object
        let marketplace = Marketplace {
            id: object::new(ctx),
        };
        transfer::share_object(marketplace);

        // 2. Setup the "Display" (So images show in wallet)
        let publisher = package::claim(otw, ctx);

        let mut keys = vector[];
        keys.push_back(string::utf8(b"name"));
        keys.push_back(string::utf8(b"image_url"));
        keys.push_back(string::utf8(b"description"));
        keys.push_back(string::utf8(b"creator"));

        let mut values = vector[];
        values.push_back(string::utf8(b"{name}"));
        values.push_back(string::utf8(b"{image_url}"));
        values.push_back(string::utf8(b"{description}"));
        values.push_back(string::utf8(b"Freak Marketplace Creator"));

        let mut display = display::new_with_fields<Freak>(
            &publisher, keys, values, ctx
        );

        // Commit the display changes
        display::update_version(&mut display);

        // Transfer the publisher and display to the deployer (you)
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // --- MINTING FUNCTION ---
    
    /// Mint a new Freak NFT
    public entry fun mint(
        name: String,
        description: String,
        url: String,
        attribute_keys: vector<String>,
        attribute_values: vector<String>,
        ctx: &mut TxContext
    ) {
        let freak = Freak {
            id: object::new(ctx),
            name: name,
            description: description,
            image_url: url,
            attribute_keys: attribute_keys,
            attribute_values: attribute_values,
        };

        // Send the NFT to the person who minted it
        transfer::public_transfer(freak, ctx.sender());
    }


    // --- MARKETPLACE FUNCTIONS ---

    /// List an item for sale.
    public fun list<T: key + store>(
        marketplace: &mut Marketplace,
        item: T,
        price: u64,
        ctx: &mut TxContext
    ) {
        let id = object::new(ctx);
        let mut listing = Listing {
            id,
            seller: ctx.sender(),
            price,
        };

        // Attach the Item to the Listing using Dynamic Object Fields
        dof::add(&mut listing.id, b"item", item);

        // Attach the Listing to the Marketplace
        dof::add(&mut marketplace.id, object::id(&listing), listing);
    }

    /// Buy an item.
    #[allow(lint(self_transfer))]
    public fun buy<T: key + store>(
        marketplace: &mut Marketplace,
        listing_id: ID,
        mut payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // 1. Remove the listing from the marketplace
        let mut listing = dof::remove<ID, Listing>(&mut marketplace.id, listing_id);

        // 2. Check payment
        let price = listing.price;
        assert!(payment.value() >= price, EInsufficientFunds);

        // 3. Handle Payment (Split if too much, Transfer to seller)
        let paid = payment.split(price, ctx);
        transfer::public_transfer(paid, listing.seller);
        transfer::public_transfer(payment, ctx.sender()); // Return change

        // 4. Retrieve the Item and transfer to Buyer
        let item = dof::remove<vector<u8>, T>(&mut listing.id, b"item");
        transfer::public_transfer(item, ctx.sender());

        // 5. Delete the Listing wrapper
        let Listing { id, seller: _, price: _ } = listing;
        object::delete(id);
    }
}