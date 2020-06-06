// JavaScript source code
import React, { Component } from "react";
import Web3 from 'web3'

import logo from './pokeball.svg';
import crtInterface from './interface.json'


import Warzone_bg from './cards/green-tank.png'
import MyDeck_bg from './cards/Monstre_et_cie.jpg'
import Help_bg from './cards/Help.jpg'
import Market_bg from './cards/Market.jpg'
import Incubator_bg from './cards/Incubator.jpg'

import Wimpy from './cards/Wimpy.jpg'
import Chikisor from './cards/Chikisor.jpg'
import ChikenSaiyan from './cards/ChikenSaiyan.jpg'
import Foxy from './cards/Foxy.jpg'
import DreadFox from './cards/DreadFox.png'
import Kiubite from './cards/Kiubite.jpg'
import Pythoneche from './cards/Pythoneche.jpg'
import Crotalux from './cards/Crotalux.jpg'
import Balboarus from './cards/Balboarus.png'

import img1 from './cards/contract_img/Diapositive1.JPG'
import img2 from './cards/contract_img/Diapositive2.JPG'
import img3 from './cards/contract_img/Diapositive3.JPG'
import img4 from './cards/contract_img/Diapositive4.JPG'
import img5 from './cards/contract_img/Diapositive5.JPG'
import img6 from './cards/contract_img/Diapositive6.JPG'
import img7 from './cards/contract_img/Diapositive7.JPG'
import img8 from './cards/contract_img/Diapositive8.JPG'


const IMGS = [ Wimpy, Chikisor, ChikenSaiyan,Foxy , DreadFox, Kiubite,Pythoneche, Crotalux , Balboarus]

const NAMES = ['Wimpy', 'Chikisor',' ChikenSaiyan','Foxy' , 'DreadFox', 'Kiubite','Pythoneche', 'Crotalux' , 'Balboarus']

const Contract_imgs = [img1,img2,img3,img4,img5,img6,img7,img8]

const CONTRACT_ADDRESS = '0xef848E3b7f6D49281a59F78908f0594799CB3a92'



async function getAccounts() {
    return window.ethereum.enable()
}

async function getCards(web3, account) {
    const crt = new web3.eth.Contract(crtInterface, CONTRACT_ADDRESS, { from: account })
    const totalCards = parseInt(await crt.methods.totalCards().call())

  return Promise.all([...Array(totalCards).keys()].map(
    id => crt.methods.cards(id).call()
  ))
}





class Main extends Component {
    state = {
        cards: [],
        balance: 0,
        selectedId: -1,
        resLastFight: 0,
        selectedProtectId: -1,
        };
    
    getManagerAdress(web3, account) {
        const crt = new web3.eth.Contract(crtInterface, CONTRACT_ADDRESS, { from: account })
        console.log(crt.options)
        const managerAdress = crt.methods.manager().call();
        return managerAdress;
    }
 
    componentDidMount() {
        
        this._getAccounts = getAccounts().then(
          accounts => {
              this._getAccounts = null;
              this._web3 = new Web3(window.ethereum);
              this._account = accounts[0];
              this.updateBalance()
              this.refreshCards();
              this.refreshHomePage();
          }
        );
    }
    componentWillUnmount() {
        if (this._getAccounts) {
            this._getAccounts.cancel();
        }

        if (this._getCards) {
            this._getCards.cancel();
        }
    }
    refreshCards() {
        this._getCards = getCards(this._web3, this._account).then(
          _cards => {
              this._getCards = null
              this.setState({cards: _cards})
          }
        )
    }
    buyCard(id, price) {
        const crt = new this._web3.eth.Contract(crtInterface, CONTRACT_ADDRESS, {from: this._account})
        crt.methods.buyCard(id).send({value: price*1e18}).then( () => {
            this.refreshCards();
            this.updateBalance();
        })
    }

    updateBreed(id){
        const crt = new this._web3.eth.Contract(crtInterface, CONTRACT_ADDRESS, {from: this._account})
 
        try {
            crt.methods.updateBreeding(id).send().then( () => {
                this.refreshCards();
                this.updateBalance();
            })
        }
        catch(err){
            console.log(err)
        } 

    }
    
    changeCardState(id, newState) {
        const crt = new this._web3.eth.Contract(crtInterface, CONTRACT_ADDRESS, {from: this._account})
        if (newState === 3) {
            try {
                crt.methods.tradingCard(id).send().then( () => {
                this.refreshCards();
                this.updateBalance();
                this.setState({selectedId: -1})
                
            })
            }
            catch(err){
                console.log('in the error')
                console.log(err)
            }
        }
        if (newState === 2) {
            try {
                crt.methods.BreedingCard(id).send().then( () => {
                    this.refreshCards();
                    this.updateBalance();
                    this.setState({selectedId: -1})
                })
            }
            catch(err){
                console.log(err)
            }
        }
        if (newState === 0) {
            try {
                crt.methods.fightingMode(id).send().then( () => {
                    this.refreshCards();
                    this.updateBalance();
                    this.setState({selectedId: -1})
                })
            }
            catch(err){
                console.log(err)
            }
        }
        if (newState === 1) {
            try {
                crt.methods.Protecting(this.state.selectedProtectId,id).send().then( () => {
                    this.refreshCards();
                    this.updateBalance();
                    this.setState({selectedId: -1})
                    this.setState({selectedProtectId: -1})
                })
            }
            catch(err){
                console.log('in the error')
                console.log(err)
            }
        }

       
    }
    
    updateBalance() {
        this._web3.eth.getBalance(this._account).then(
            _balance => {  
                //const newBalance = this._web3.utils.toWei(_balance,'wei');
                const newBalance = _balance*1e-18
                this.setState({balance: newBalance});
            });
    }
    updateLastFight() {
        this._web3.eth.getBalance(this._account).then(
            _balance => {  
                //const newBalance = this._web3.utils.toWei(_balance,'wei');
                const newBalance = _balance*1e-18
                this.setState({balance: newBalance});
            });
    }

    fight(adversaryId,choiceofAttack) {
        var toRet;
        const crt = new this._web3.eth.Contract(crtInterface, CONTRACT_ADDRESS, {from: this._account});
        
        crt.methods.Fight(this.state.selectedId,adversaryId,choiceofAttack).send().then( winner => {
            this.refreshCards();
            this.updateBalance();
            this.setState({selectedId: -1});
   
            this.setState({resLastFight : winner});
            crt.methods.resLastAttack().call().then(function(result) {  
                if (parseInt(result) === 1){
                alert('The winner is the attacker')}
                if (parseInt(result) ===2) {alert('The winner is the defenser')}});



            
        });

      

    }


    shareCard(id, price) {
        const crt = new this._web3.eth.Contract(crtInterface, CONTRACT_ADDRESS, {from: this._account})
        crt.methods.shareCard(id).send({value: (((price+1)*1e18)/3)}).then( () => {
            this.refreshCards();
            this.updateBalance();
        })
    }

    unProtect(id) {
        const crt = new this._web3.eth.Contract(crtInterface, CONTRACT_ADDRESS, {from: this._account})
        crt.methods.unProtect(id).send().then( () => {
            this.refreshCards();
        })

    }

    modeInt2String(modeStr) {
        var mode = parseInt(modeStr);
        if (mode === 0){
            return('Attack');
        }
        if (mode === 1){
            return('Protect');
        }
        if (mode === 2){
            return('Breed');
        }
        if (mode === 3){
            return('Trade');
        }
        
    }

    refreshHomePage() {
        var i, tabcontent, tablinks;
  
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
          
        }

        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
    }

    openTab(evt, tabName) {
        var i, tabcontent, tablinks;
        
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            if (tabcontent[i].id === tabName) {
                tabcontent[i].style.display = "block";
            } else {
                tabcontent[i].style.display = "none";
            }
        }

        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
    
        evt.target.className += " active";
    }

    openContract(evt,tabName){
        var contract =document.getElementsByClassName(tabName)[0]
        contract.style.visibility = "visible";
    }

    nextPage(){
        var img = document.getElementById('contract_img')
        var found = false;
        for(var i=0;i<Contract_imgs.length-1;i++){
            if(Contract_imgs[i] == img.src.split('http://localhost:3000')[1]){
                found = true;
                img.src = Contract_imgs[i+1];
            }
        }
        if (! found) {
            img.src = Contract_imgs[0];
        }
    }

    previousPage(){
        var found = false;
        var img = document.getElementById('contract_img')
        for(var i=1;i<Contract_imgs.length;i++){
            if(Contract_imgs[i] == img.src.split('http://localhost:3000')[1]){
                found = true;
                img.src = Contract_imgs[i-1];
            }
        }
        if (! found) {
            img.src = Contract_imgs[Contract_imgs.length-1];
        }
    }

    
    my_prompt(normal_price,id) {
        var price = prompt("Please enter your price", normal_price);
        if (price > normal_price){

            this.buyCard(id, price)
        }
        else {alert('you have to enter a price larger than the normal one')}
    }


    

    render() {
        var contract_img = <img id='contract_img' src={Contract_imgs[0]} height='400' width='400' /> ;
        const DeckCards = this.state.cards.map(card => 
        {   
            if (card.owner.toLowerCase()===this._account){

                return <div className='card' key={card.id}>
                        <div className='cardname'> {NAMES[parseInt(card.species) + parseInt(card.level)]}</div>
                        <div className='card_img'>
                        <img src={IMGS[parseInt(card.species)]} height='150' width='120' alt={card.species}/>
                        </div>
                        <div className='card_info'>
                        <p>ATK : {card.attack} | DEF : {card.defense}</p>
                        <p>EXP : {card.experience} | HP: {card.HP}</p>  
                        <p>Mode: {this.modeInt2String(card.mode)}</p>
                        </div>
            </div>
        }
    return null;
    }
    );
        const FightingCards = this.state.cards.map(card => 
        {
            if ((card.owner.toLowerCase()===this._account) && (parseInt(card.mode) ===  0)) {
                var fightingButton;
                if (this.state.selectedId === card.id) {
                    fightingButton = <p><button onClick={()=>this.setState({selectedId: -1})}>Deselect</button></p>;
                } else {
                fightingButton = <p><button onClick={() => this.setState({selectedId: card.id})}>Attack</button></p>;
                }

                var protectingButton;
                if (this.state.selectedProtectId === card.id) {
                    protectingButton = <button onClick={()=>this.setState({selectedProtectId: -1})}>Deselect</button>;
                } else {
                protectingButton = <button onClick={() => this.setState({selectedProtectId: card.id})}>Protect</button>;
                }
                var breedingButton;
                if (card.experience < 1000) {
                    breedingButton = <button onClick={()=>alert('not enough experience to evolve')}>Breed</button>;
                    } else {
                        
                        breedingButton = <button onClick={() => {
                      
                            if (parseInt(card.level) == 2){
                                alert('the monster has already reached its maximum level.')}
                                else{this.changeCardState(card.id, 2)}}}>Breed</button>;
                    }
                
      return <div className='card' key={card.id}>
              <div className='cardname'>{NAMES[parseInt(card.species)]}</div>
              <div className='card_img'>
              <img src={IMGS[parseInt(card.species)]} height='150' width='120' alt={card.species}/>
              </div>
              <div className='card_info'>
              <p>ATK : {card.attack} | DEF : {card.defense}</p>
              <p>EXP : {card.experience} | HP: {card.HP}</p>  
              <p>Owner: {card.owner}</p>
              <p>Sharer: {card.sharer}</p>
              <p>Mode: {this.modeInt2String(card.mode)}</p>
              {protectingButton}  {breedingButton} 
              <button onClick={()=>this.changeCardState(card.id, 3)}>Put on the market</button>
              {fightingButton}
              </div>   
            </div>
        }
        return null;
        }
        );

            const SharingCards = this.state.cards.map(card => 
            {
                if ((card.sharer.toLowerCase()===this._account) && (parseInt(card.mode) === 0)) {
                    var fightingButton;
                    if (this.state.selectedId === card.id) {
                        fightingButton = <p><button onClick={()=>this.setState({selectedId: -1})}>Deselect</button></p>;
                    } else {
                    fightingButton = <p><button onClick={() => this.setState({selectedId: card.id})}>Attack</button></p>;
                    }
                    return <div className='card' key={card.id}>
                            <div className='cardname'>{NAMES[parseInt(card.species)]}</div>
                                                    <div className='card_img'>
                        <img src={IMGS[parseInt(card.species)]} height='150' width='120' alt={card.species}/>
                        </div>
                        <div className='card_info'>
                            <p>ATK : {card.attack} | DEF : {card.defense}</p>
                            <p>EXP : {card.experience} | HP: {card.HP}</p>  
                            <p>Price: {card.price}</p>
                            <p>Owner: {card.owner}</p>
                            <p>Sharer: {card.sharer}</p>
                            <p>RemainingFights : {card.remainingFightsSharer}</p>
                            {fightingButton}
                        </div>
        </div>
            }
    return null;
    }
    );

        const TradingCards = this.state.cards.map(card => 
            {   
                if ((card.owner.toLowerCase()===this._account) && (parseInt(card.mode) === 3)) {

                    return <div className='card' key={card.id}>
                            <div className='cardname'>{NAMES[parseInt(card.species)]}</div>
                            <div className='card_img'>
                            <img src={IMGS[parseInt(card.species)]} height='150' width='120' alt={card.species}/>
                            </div>
                            <div className='card_info'>                            
                            <p>ATK : {card.attack} | DEF : {card.defense}</p>
                            <p>EXP : {card.experience} | HP: {card.HP}</p>  
                            <p>Price: {card.price}</p>
                            <button onClick={()=>this.changeCardState(card.id, 0)}>Go Back to WAR!</button>  
                            </div>
                </div>
            }
    return null;
    }
    );
        const OpponentsTradingCards = this.state.cards.map(card => 
        {
            if ((card.owner.toLowerCase()!==this._account) && (parseInt(card.mode) === 3)) {

                return <div className='card' key={card.id}>
                        <div className='cardname'>{NAMES[parseInt(card.species)]}</div>
                        <div className='card_img'>
                        <img src={IMGS[parseInt(card.species)]} height='150' width='120' alt={card.species}/>
                        </div>
                        <div className='card_info'>                        
                        <p>ATK : {card.attack} | DEF : {card.defense}</p>
                        <p>EXP : {card.experience} | HP: {card.HP}</p>  
                        <p>Price: {card.price}</p>
                        <p>Owner: {card.owner}</p>
                        <p>Sharer: {card.sharer}</p>
                        <button onClick={()=> this.buyCard(card.id, parseInt(card.price))}>Buy</button>
                        <button onClick={()=> this.shareCard(card.id, parseInt(card.price)/3)}>Share</button>
                        <button onClick={()=> this.my_prompt(parseInt(card.price),card.id)}>Buy own price</button>
                        </div>
                    </div>
        }
    return null;
    }
    );
        const BreedingCards = this.state.cards.map(card => 
        {
            if ((card.owner.toLowerCase()===this._account) && (parseInt(card.mode) === 2)) {
                var nameOfProtector;
                if (card.idOfProtector !== card.id){
                    nameOfProtector = <p>Protected by : {NAMES[parseInt(this.state.cards[card.idOfProtector].species) ]}</p>
                          
                }  
                return <div className='card' key={card.id}>
                        <div className='cardname'>{NAMES[parseInt(card.species)]}</div>
                        <div className='card_img'>
                        <img src={IMGS[parseInt(card.species)]} height='150' width='120' alt={card.species}/>
                        </div>
                        <div className='card_info'>                        
                        <p>Mode: {this.modeInt2String(card.mode)}</p>
                      
                        {nameOfProtector}
                        
                         
                        <button onClick={()=>this.updateBreed(card.id)}>Update</button> 
                        <button onClick={() => {
                          if (this.state.selectedProtectId === -1){
                              alert('You have to select one of your own cards to be the protector !');
                          }
                            else {
                              this.changeCardState(card.id, 1);
                            }
        }}>Protect</button>
            </div>
            </div>
        }
    return null;
    }
    );
            const OpponentsFightingCards = this.state.cards.map(card => 
            {   
                if ((card.owner.toLowerCase()!==this._account) && (parseInt(card.mode) !== 3) && (card.sharer.toLowerCase()!==this._account)) {

                    var nameOfProtector;
                    if (card.idOfProtector !== card.id){
                        nameOfProtector = <p>Protected by : {NAMES[parseInt(this.state.cards[card.idOfProtector].species)]}</p>
                          
                    } 
                    return <div className='card' key={card.id}>
                            <div className = 'cardname'>{NAMES[parseInt(card.species)]}</div>
                        <div className='card_img'>
                        <img src={IMGS[parseInt(card.species)]} height='150' width='120' alt={card.species}/>
                        </div>
                        <div className='card_info'>                            <p>ATK : {card.attack} | DEF : {card.defense}</p>
                            <p>EXP : {card.experience} | HP: {card.HP}</p>  
                            <p>Price: {card.price}</p>
                            <p>Owner: {card.owner}</p>
                            <p>Mode: {this.modeInt2String(card.mode)}</p>
                    {nameOfProtector}
                    <button onClick={() => {
                      if (this.state.selectedId === -1){
                                    alert('You have to select one of your own cards to fight !');
                }
                else {
                    this.fight(card.id,1);

                }}}>Headshot</button>
                        <button onClick={() => {
                          if (this.state.selectedId === -1){
                          alert('You have to select one of your own cards to fight !');
    }
                                    else {
                                        this.fight(card.id,0);
                                    }
            }}>Quickshot</button>
                        <button onClick={() => {
                                          if (this.state.selectedId === -1){
                                          alert('You have to select one of your own cards to fight !');
                }
                else {
                    this.fight(card.id,2);
                }
                        }}>Strongshot</button>
                            </div>
            </div>
        }
    return null;
    }
    );
        const ProtectingCards = this.state.cards.map(card => 
        {
            if ((card.owner.toLowerCase()===this._account) && (parseInt(card.mode) === 1)) {
                
                return <div className='card' key={card.id}>
                        <div className='cardname'>{NAMES[parseInt(card.species)]}</div>
                        <div className='card_img'>
                        <img src={IMGS[parseInt(card.species)]} height='150' width='120' alt={card.species}/>
                        </div>
                        <div className='card_info'>                        
                            <p>ATK : {card.attack} | DEF : {card.defense}</p>
                        <p>EXP : {card.experience} | HP: {card.HP}</p>  
                        <p>Mode: {this.modeInt2String(card.mode)}</p>
                        <button onClick={()=> {                           
                            
                            this.changeCardState(card.id, 0)
                            for (var i=0;i<BreedingCards.length;i++){
                                if((this.state.cards[i].idOfProtector === card.id) && (parseInt(card.id) !== i)){
               
                                    this.unProtect(i);
                                }
                            }
                            }
                            }>Go Back to WAR!</button>
            </div>
            </div>
        }
    return null;
    }
    );
        return (
         

         <div>   
            <div id="MyDeck" className="tabcontent">
            <div className="subtabcontent">
                <img src={MyDeck_bg} className="background" alt='background' height='250' width='350'/>
            </div>
            </div>

            <div id="MarketPlace" className="tabcontent">
            <div className="subtabcontent">
                <img src={Market_bg} className="background" alt="background" height='250' width='250'/>
            </div>
            </div>

            <div id="Warzone" className="tabcontent">
            <div className="subtabcontent">
                <img src={Warzone_bg} className="background" alt="background" height='250' width='325'/>
            </div>
            </div>

            <div id="Incubator" className="tabcontent">
            <div className="subtabcontent">
                <img src={Incubator_bg} className="background" alt="background" height='250' width='250'/>
            </div>
            </div>

            <div id="Help" className="tabcontent">
            <div className="subtabcontent">
                <img src={Help_bg} className="background" alt="background" height='250' width='250'/>
            </div>
            </div>

         


              <img src={logo} className="App-logo" alt="logo" height = '150' width='150'/>
              <h1>Crpytomons</h1>
                <div className="tab">
                <button className="tablinks" onClick={() => this.openTab(window.event, 'MyDeck')}>My Deck</button>
                  <button className="tablinks" onClick={() => this.openTab(window.event, 'MarketPlace')}>Market Place</button>
                  <button className="tablinks" onClick={() => this.openTab(window.event, 'Warzone')}>Warzone</button>
                  <button className="tablinks" onClick={() => this.openTab(window.event, 'Incubator')}>Incubator</button>
                  <button className="tablinks" onClick={() => this.openTab(window.event, 'Help')}>Help</button>
                </div>

        
      
        <div id="MyDeck" className="tabcontent">
            <div id='MyInfo'>
            <h4>My address is : {this._account}</h4> 
            <h4>My balance is : {this.state.balance.toString().substring(0,6)}</h4>
              
                  
            </div>
                      <div className="subtabcontent">
                      <h3>My Cards</h3>
            
            {DeckCards}
                      </div>
       
                   </div>

                  <div id="MarketPlace" className="tabcontent">
                      <div className="subtabcontent">
                      <h3>My Cards</h3>
            {TradingCards}
                      </div>
                      <div className="subtabcontent">
                      <h3>Opponents Cards</h3>
            {OpponentsTradingCards}
                      </div>

                  </div>
        
                  <div id="Incubator" className="tabcontent">
                      <div className="subtabcontent">
                      <h3>My Cards</h3>
            {BreedingCards}
                      </div>
                      <div className="subtabcontent">
                      <h3>Protectors</h3>
            {ProtectingCards}
                      </div>

                  </div>
        

                 <div id="Warzone" className="tabcontent">
                      <div className="subtabcontent">
                      <h3>My Warriors</h3>
            {FightingCards}
                      </div>
                      <div className="subtabcontent">
                      <h3>Shared cards</h3>
            {SharingCards}
                      </div>

                      <div className="subtabcontent">
                      <h3>Opponents Cards</h3>
            {OpponentsFightingCards}
                      </div>

                  </div>
                         <div id="Help" className="tabcontent">
                      <div className="subtabcontent">
                      <h3>Rules</h3>
                      The cryptomons is very easy to use. Each player must own the greatest number of monsters. To acquire some, one can buy a monster on the market place or win a figth against an other player.
                      There are three races of monsters : The Snakes, the Chickens and the Foxes. Each race has three levels of evolution. The more evaluted a monster is the stronger. 
                      The following items explain every game's mode. 
                      <h4>My Deck</h4>
                      In the Deck tab, the owner can see his monster, their attributes and their current mode.
                      The owner can also see his balance and his address.
                      <h4>The market place</h4>
                      In the market place, one can see his monster which are in the selling mode with their price. While they are in the market place, monsters can not do anything. With their button, the owner can change his monster's mode to the fight mode.
                      The owner can also see the opponents cards that are in the selling mode. Their are three buttons. With the first one 'Buy', one can buy the monster with its regular price to become his owner. 
                      With the sharing button, one can became the sharer of a monster. A sharer has then the card for only three attacks. He is not the owner so he ca not do anything with the card except figthing. If the owner has a sharer, then he can not do anything with his card while the sharer has not 
                      done his three figths. To become a sharer, one can hit the share button and pay the card a third of the regular monster's price.
                      Finally, the last button is 'buy own price' to decide to pay the monster a price higher thant the regular one. 
                      <h4>The Warzone</h4>
                      In the warzone menu, the owner can set his monsters' mode with the different menu. He can set a monster's mode to Selling by putting them in the market place. He can also set a monster to breed if his experience is higher than 1000 XP. 
                      If the owner has some monster evolving, he can also protect one of them with one of his attacker monsters. If someone attacks a breeding monster protected by an other monster, he fights finally against the protector.
                      Finally, a player can figths with one of his attacking cards or sharing cards. He must then choose an opponent's monster. He must select an attack. First, a headshot. The attack has 50% chance to hit his target and 50% chance to fail. One headshot hit kills the defenser. 
                      The second attack is the Quickshot. The quickshot is quick but weak. It has 10% more chance to reach its opponent with an attack 0.8 times of his monster's attack. Finally, the Strongshot is 20% stronger than the regular attack but has 10% more chance to fail its attack. 
                      The defenser always defend itself with a Quickshot attack. Each monster throws an hit alternatively until a monster dies. When a monster wins, the owner take the opponent's card.
                      As it is coward to attack an evolving monster, the defenser has 15% more chance to esquive the attack. 
                      Finally, following the food chain, an attacker hits 50% times harder if the defenser follows it in the food chain : The fox eats the chicken which eats the snake which eats the fox.
                      <h4>The Incubator</h4>
                      In the Incubator menu, the owner can see his breeding monsters and their protectors. He must hit three times the the update button to succeed the evolution of his monster. He can also 
                      protect a breeding monster by hitting the protect button if he has already selected a protector in the warzone menu. One breeding monster can be protected only by one monster at the time.
                      If a breeding monster is killed he does not evovle and become the attacker's monster. If a monster breeds successfully, then the owner looses it and gets a monster with the same race with its next level. 
                      </div>

                

            <div className="subtabcontent">
            <h3>The smart contract</h3>
            <div className="contract_box">
            {contract_img}
            <div className="contract_buttons">
            <button className="stup" onClick={() => this.nextPage()}>Next Page</button>
            <button className="stup" onClick={() => this.previousPage()}>Previous Page</button>
            </div>
            </div>
            </div>
        </div>

        </div>


      );
            }
}
 
export default Main;